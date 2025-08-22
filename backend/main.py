import asyncio
import json
import logging
import os
import sys
import threading
import time
import subprocess
from typing import Any, Dict, Optional, Set
from asyncio import AbstractEventLoop

import cv2
import av
import websockets
from websockets.server import WebSocketServerProtocol

from dotenv import load_dotenv
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
from joblib import load
import numpy as np
import re

av.logging.set_level(av.logging.ERROR)

load_dotenv()


WS_PORT = int(os.getenv("WS_PORT", "8765"))

# Load the stress model once
def load_stress_model():
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'stress_rf.joblib')
        meta_path = os.path.join(os.path.dirname(__file__), 'models', 'model_metadata.json')
        # Load model and metadata
        model = load(model_path)
        with open(meta_path, 'r') as f:
            metadata = json.load(f)
        # Extract features from metadata
        features = metadata.get('features', [])
        medians = metadata.get('medians', {})
        return model, features, medians
    except Exception as e:
        print(f"❌ Error loading stress model: {e}")
        return None, None, None

STRESS_MODEL, FEATURE_LIST, FEATURE_MEDIANS = load_stress_model()

def preprocess_window(window_data):
    if not FEATURE_LIST or not FEATURE_MEDIANS:
        return None
    
    # Flatten the window data similar to ingest_label_windows
    def flatten_dict(d, prefix=''):
        flat = {}
        for k, v in d.items():
            if isinstance(v, dict):
                flat.update(flatten_dict(v, prefix=f"{prefix}{k}."))
            else:
                flat[f"{prefix}{k}"] = v
        return flat
    
    flat_data = flatten_dict(window_data)
    
    # Select and preprocess features
    features_subset = []
    for feat in FEATURE_LIST:
        value = flat_data.get(feat, np.nan)
        if value is None:
            value = np.nan
        features_subset.append(value)
    
    # Replace NaNs with stored medians from training
    for i, feat in enumerate(FEATURE_LIST):
        if np.isnan(features_subset[i]):
            features_subset[i] = FEATURE_MEDIANS.get(feat, 0)
    
    return np.array(features_subset).reshape(1, -1)

AGENT_CMD = os.getenv("AGENT_CMD")
outbox: "asyncio.Queue[Dict[str, Any]]" = asyncio.Queue()

tcs: Set[RTCPeerConnection] = set()
webrtc_ready = threading.Event()

# Buffer candidates until peer connection is ready
pending_candidates: list = []
connection_ready = False

os.makedirs("frames", exist_ok=True)
latest_frame_path = os.path.join("frames", "latest_frame.jpg")
webrtc_status_path = os.path.join("frames", "webrtc_ready")

def _msg(msg_type: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {"type": msg_type, "payload": payload or {}}


clients: Set[WebSocketServerProtocol] = set()
MAIN_LOOP: Optional[AbstractEventLoop] = None
LAST_CLIENT_ID: Optional[str] = None

def ws_send_sync(msg_type: str, payload: Optional[Dict[str, Any]] = None) -> None:
    """Thread-safe broadcast helper for payload-wrapped messages."""
    global MAIN_LOOP
    msg = json.dumps(_msg(msg_type, payload))
    targets = list(clients)
    for ws in targets:
        try:
            if MAIN_LOOP is not None:
                asyncio.run_coroutine_threadsafe(ws.send(msg), MAIN_LOOP)
            else:
                # Best-effort fallback if called from within the event loop
                asyncio.get_running_loop().create_task(ws.send(msg))
        except Exception:
            # Suppress to avoid crashing sender threads
            pass

def ws_broadcast_raw(message: Dict[str, Any]) -> None:
    """Thread-safe broadcast of a pre-shaped JSON object to all clients."""
    global MAIN_LOOP
    try:
        msg = json.dumps(message)
    except Exception as e:
        print(f"⚠️ Failed to encode message: {e}")
        return
    targets = list(clients)
    for ws in targets:
        try:
            if MAIN_LOOP is not None:
                asyncio.run_coroutine_threadsafe(ws.send(msg), MAIN_LOOP)
            else:
                # Best-effort fallback if called from within the event loop
                asyncio.get_running_loop().create_task(ws.send(msg))
        except Exception:
            # Suppress to avoid crashing sender threads
            pass


def send_log(event: str, message: str) -> None:
    ws_send_sync(f"logs.{event}", {"message": message})


async def handle_offer(payload: Dict[str, Any], ws: WebSocketServerProtocol) -> None:
    offer_sdp = payload.get("sdp")
    offer_type = payload.get("type")
    print(f"🤝 Received WebRTC offer: type={offer_type}")
    if not offer_sdp or not offer_type:
        await ws.send(json.dumps(_msg("error", {"reason": "Invalid offer payload"})))
        return

    pc = RTCPeerConnection()
    tcs.add(pc)
    print(f"🔗 Created RTCPeerConnection, total connections: {len(tcs)}")

    @pc.on("track")
    def on_track(track):
        print(f"🎥 Received track: kind={track.kind}, id={track.id}")
        if track.kind == "video":
            print("📹 Video track detected, starting frame capture...")
            async def recv_frames() -> None:
                webrtc_ready.set()
                try:
                    with open(webrtc_status_path, "w") as f:
                        f.write("ready")
                    print("✅ WebRTC status file created")
                except Exception as e:
                    print(f"⚠️ Failed to write webrtc status file: {e}")

                frame_count = 0
                while True:
                    try:
                        frame = await track.recv()
                        frame_count += 1
                        
                        img = frame.to_ndarray(format="bgr24")
                        
                        # Atomic write: write to temp file first, then rename
                        temp_path = latest_frame_path + ".tmp"
                        success = await asyncio.to_thread(cv2.imwrite, temp_path, img)
                        
                        if success:
                            # Atomic rename to avoid partial reads
                            await asyncio.to_thread(os.rename, temp_path, latest_frame_path)
                        else:
                            print(f"⚠️ Failed to write frame #{frame_count}")
                            # Clean up temp file if write failed
                            try:
                                await asyncio.to_thread(os.remove, temp_path)
                            except:
                                pass
                        
                        if frame_count % 100 == 1:
                            print(f"📸 Frame #{frame_count} saved ({img.shape})")
                        
                    except Exception as e:
                        print(f"⚠️ Failed to process frame #{frame_count}: {e}")
                        break

            asyncio.create_task(recv_frames())
        else:
            print(f"🔊 Non-video track received: {track.kind}")
    desc = RTCSessionDescription(offer_sdp, offer_type)
    await pc.setRemoteDescription(desc)
    print("📝 Set remote description (offer)")
    
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    print("📝 Created and set local description (answer)")
    
    print("⏳ Waiting for ICE gathering to complete...")
    while pc.iceGatheringState != "complete":
        await asyncio.sleep(0.1)
    print(f"🧊 ICE gathering complete: {pc.iceGatheringState}")
    
    await ws.send(json.dumps(_msg("webrtc.answer", {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
    })))
    print("📤 Sent WebRTC answer to client")
    
    # Mark connection as ready and process any buffered candidates
    global connection_ready, pending_candidates
    connection_ready = True
    print(f"🔗 Connection ready! Processing {len(pending_candidates)} buffered candidates...")
    
    # Process any candidates that arrived while we were setting up
    for buffered_payload in pending_candidates:
        try:
            await handle_candidate_internal(buffered_payload)
        except Exception as e:
            print(f"⚠️ Error processing buffered candidate: {e}")
    
    pending_candidates.clear()
    print("✅ All buffered candidates processed")


async def handle_candidate(payload: Dict[str, Any]) -> None:
    """Main candidate handler that buffers candidates if connection isn't ready"""
    global connection_ready, pending_candidates
    
    if not connection_ready:
        print(f"📦 Buffering ICE candidate (total buffered: {len(pending_candidates) + 1})")
        pending_candidates.append(payload)
        return
    
    await handle_candidate_internal(payload)


async def handle_candidate_internal(payload: Dict[str, Any]) -> None:
    """Internal candidate handler that processes candidates immediately"""
    candidate_str = payload.get("candidate")
    sdp_mid = payload.get("sdpMid")
    sdp_mline_index = payload.get("sdpMLineIndex")
    
    if not candidate_str:
        print("⚠️ No candidate string provided - this is normal during ICE gathering")
        return  # Don't treat this as an error
    
    # Handle empty candidate (end-of-candidates indicator)
    if candidate_str.strip() == "":
        print("ℹ️ End-of-candidates indicator received")
        return
    
    # Add initial delay for very early candidates to allow connection setup
    if len(tcs) == 0:
        print("⏳ Waiting for peer connection to be established...")
        await asyncio.sleep(1.0)  # Give connection time to establish
    
    max_retries = 3
    retry_count = 0
    base_delay = 0.5  # Start with 500ms delay
    
    while retry_count < max_retries:
        try:
            retry_count += 1
            
            # Wait longer if peer connections aren't ready yet
            if len(tcs) == 0:
                wait_time = base_delay * retry_count * 2  # Progressive delay: 1s, 2s, 4s
                print(f"⏳ No peer connections available, waiting {wait_time}s before retry {retry_count}")
                await asyncio.sleep(wait_time)
                
            # Check if we have active connections
            if len(tcs) == 0:
                print(f"⚠️ No peer connections available for ICE candidate (attempt {retry_count})")
                if retry_count < max_retries:
                    continue
                else:
                    print("❌ No peer connections established after all retries")
                    return
            parts = candidate_str.split()
            if len(parts) < 8 or not parts[0].startswith("candidate:"):
                print(f"⚠️ Invalid candidate format (attempt {retry_count}): {candidate_str}")
                if retry_count < max_retries:
                    await asyncio.sleep(0.1)  # Brief delay before retry
                    continue
                else:
                    return
                
            foundation = parts[0][10:]
            component = int(parts[1])
            protocol = parts[2].lower()
            priority = int(parts[3])
            ip = parts[4]
            port = int(parts[5])
            typ = parts[6]
            candidate_type = parts[7]
            cand = RTCIceCandidate(
                component=component,
                foundation=foundation,
                ip=ip,
                port=port,
                priority=priority,
                protocol=protocol,
                type=candidate_type,
                sdpMid=sdp_mid,
                sdpMLineIndex=sdp_mline_index
            )
            
            # Try to add candidate to all active peer connections
            successful_adds = 0
            total_connections = len(tcs)
            print(f"🔍 Attempting to add ICE candidate to {total_connections} peer connection(s)")
            
            for i, pc in enumerate(list(tcs)):
                try:
                    connection_state = getattr(pc, 'connectionState', 'unknown')
                    ice_state = getattr(pc, 'iceConnectionState', 'unknown')
                    print(f"   PC #{i}: connectionState={connection_state}, iceConnectionState={ice_state}")
                    
                    await pc.addIceCandidate(cand)
                    successful_adds += 1
                    print(f"   ✅ ICE candidate added to PC #{i}")
                except Exception as e:
                    print(f"   ❌ ICE add failed on PC #{i}: {e}")
                    
            print(f"📊 ICE candidate results: {successful_adds}/{total_connections} successful")
            
            if successful_adds == 0 and total_connections > 0:
                print("⚠️ No peer connections accepted the ICE candidate")
            elif successful_adds < total_connections:
                print(f"⚠️ Some peer connections ({total_connections - successful_adds}) rejected the ICE candidate")
            else:
                print("✅ All peer connections accepted the ICE candidate")
                
            if successful_adds > 0:
                print(f"✅ ICE candidate added successfully to {successful_adds} connection(s)")
                break
            else:
                wait_time = base_delay * retry_count  # Progressive delay: 0.5s, 1s, 1.5s
                print(f"⚠️ Failed to add ICE candidate to any connections (attempt {retry_count})")
                if retry_count < max_retries:
                    print(f"⏳ Waiting {wait_time}s before retry...")
                    await asyncio.sleep(wait_time)
                    
        except (ValueError, IndexError) as e:
            wait_time = base_delay * retry_count
            print(f"⚠️ Failed to parse candidate '{candidate_str}' (attempt {retry_count}): {e}")
            if retry_count < max_retries:
                print(f"⏳ Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
                continue
            else:
                break
        except Exception as e:
            wait_time = base_delay * retry_count
            print(f"⚠️ Unexpected error handling candidate (attempt {retry_count}): {e}")
            if retry_count < max_retries:
                print(f"⏳ Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
                continue
            else:
                break
    
    if retry_count >= max_retries:
        print(f"❌ Failed to handle ICE candidate after {max_retries} attempts")


async def webrtc_capture_frame() -> Dict[str, Any]:
    try:
        if not os.path.exists(webrtc_status_path):
            return {"status": "error", "error": "WebRTC connection not established yet"}

        if os.path.exists(latest_frame_path):
            frame = await asyncio.to_thread(cv2.imread, latest_frame_path)
            if frame is None:
                return {"status": "error", "error": "Failed to read frame from file"}
            return {"status": "success", "frame": frame}
        else:
            return {"status": "error", "error": "No frames available yet"}
    except Exception as e:
        return {"status": "error", "error": f"WebRTC error: {str(e)}"}

agent_thread: Optional[threading.Thread] = None


def start_agent(_data: Optional[Dict[str, Any]] = None) -> None:
    global agent_thread
    if agent_thread and agent_thread.is_alive():
        print("🔹 Agent already running.")
        return

    def _run():
        webrtc_ready.wait()
        print("🔹 WebRTC ready, starting agent.")

        if AGENT_CMD:
            cmd = AGENT_CMD.split()
        else:
            candidate = os.path.join(os.path.dirname(__file__), "agent.py")
            if not os.path.exists(candidate):
                err = "agent.py not found and AGENT_CMD not set."
                print(f"❌ {err}")
                send_log("new_log", f"❌ {err}")
                return
            cmd = [sys.executable, "-u", candidate]

        print(f"⏳ Starting agent subprocess: {cmd}")
        try:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
        except Exception as e:
            print(f"❌ Failed to start agent: {e}")
            send_log("new_log", f"❌ Failed to start agent: {e}")
            return

        assert proc.stdout is not None
        for raw in proc.stdout:
            line = raw.rstrip()
            print(f"[agent] {line}")
            try:
                # Check for feature window JSON printed inline (not typical currently)
                if line.startswith("{") and "window_id" in line:
                    try:
                        window_data = json.loads(line)
                        if STRESS_MODEL is not None:
                            processed_window = preprocess_window(window_data)
                            if processed_window is not None:
                                # Predict probabilities with fallbacks
                                if hasattr(STRESS_MODEL, "predict_proba"):
                                    probs = STRESS_MODEL.predict_proba(processed_window)[0]
                                    p_stressed = float(probs[1]) if len(probs) > 1 else float(probs[0])
                                elif hasattr(STRESS_MODEL, "decision_function"):
                                    score = float(STRESS_MODEL.decision_function(processed_window)[0])
                                    # Map decision score to [0,1]
                                    p_stressed = 1.0 / (1.0 + np.exp(-score))
                                else:
                                    pred = int(STRESS_MODEL.predict(processed_window)[0])
                                    p_stressed = float(pred)

                                label = "stressed" if p_stressed >= 0.5 else "calm"
                                confidence = p_stressed if label == "stressed" else (1.0 - p_stressed)
                                
                                # Derive auxiliary metrics when available
                                breathing_rate = None
                                blink_rate = None
                                posture_stress = None
                                try:
                                    ba = window_data.get("breathing_analysis", {}) or {}
                                    ea = window_data.get("eye_analysis", {}) or {}
                                    pa = window_data.get("posture_analysis", {}) or {}
                                    br = ba.get("mean_bpm")
                                    if isinstance(br, (int, float)):
                                        breathing_rate = float(br)
                                    bl = ea.get("blink_frequency")
                                    if isinstance(bl, (int, float)):
                                        blink_rate = float(bl)
                                    ps = pa.get("posture_stability")
                                    if isinstance(ps, (int, float)):
                                        # Map stability [0..1+] to stress [0..100]
                                        posture_stress = float(max(0.0, min(100.0, (1.0 - float(ps)) * 100.0)))
                                except Exception:
                                    pass

                                # Send prediction via websocket (top-level type + fields)
                                msg = {
                                    "type": "prediction",
                                    "label": label,
                                    "confidence": float(confidence),
                                    "client_id": LAST_CLIENT_ID,
                                    "timestamp": window_data.get("timestamp_start"),
                                    "window_id": window_data.get("window_id"),
                                }
                                # Attach auxiliary metrics if present
                                if breathing_rate is not None:
                                    msg["breathing_rate"] = breathing_rate
                                if blink_rate is not None:
                                    msg["blink_rate"] = blink_rate
                                if posture_stress is not None:
                                    msg["posture_stress"] = posture_stress
                                ws_broadcast_raw(msg)
                    except Exception as pred_error:
                        print(f"❌ Prediction error: {pred_error}")

                # Detect saved JSON file path from agent and run prediction by loading file
                if "Saved to: ml_training_data/window_" in line:
                    try:
                        m = re.search(r"Saved to: (ml_training_data\/window_\d+_ml_features\.json)", line)
                        if m:
                            json_path = os.path.join(os.path.dirname(__file__), m.group(1))
                            with open(json_path, 'r') as jf:
                                window_data = json.load(jf)
                            if STRESS_MODEL is not None:
                                processed_window = preprocess_window(window_data)
                                if processed_window is not None:
                                    if hasattr(STRESS_MODEL, "predict_proba"):
                                        probs = STRESS_MODEL.predict_proba(processed_window)[0]
                                        p_stressed = float(probs[1]) if len(probs) > 1 else float(probs[0])
                                    elif hasattr(STRESS_MODEL, "decision_function"):
                                        score = float(STRESS_MODEL.decision_function(processed_window)[0])
                                        p_stressed = 1.0 / (1.0 + np.exp(-score))
                                    else:
                                        pred = int(STRESS_MODEL.predict(processed_window)[0])
                                        p_stressed = float(pred)
                                    label = "stressed" if p_stressed >= 0.5 else "calm"
                                    confidence = p_stressed if label == "stressed" else (1.0 - p_stressed)
                                    # Derive auxiliary metrics when available
                                    breathing_rate = None
                                    blink_rate = None
                                    posture_stress = None
                                    try:
                                        ba = window_data.get("breathing_analysis", {}) or {}
                                        ea = window_data.get("eye_analysis", {}) or {}
                                        pa = window_data.get("posture_analysis", {}) or {}
                                        br = ba.get("mean_bpm")
                                        if isinstance(br, (int, float)):
                                            breathing_rate = float(br)
                                        bl = ea.get("blink_frequency")
                                        if isinstance(bl, (int, float)):
                                            blink_rate = float(bl)
                                        ps = pa.get("posture_stability")
                                        if isinstance(ps, (int, float)):
                                            posture_stress = float(max(0.0, min(100.0, (1.0 - float(ps)) * 100.0)))
                                    except Exception:
                                        pass

                                    msg = {
                                        "type": "prediction",
                                        "label": label,
                                        "confidence": float(confidence),
                                        "client_id": LAST_CLIENT_ID,
                                        "timestamp": window_data.get("timestamp_start"),
                                        "window_id": window_data.get("window_id"),
                                    }
                                    if breathing_rate is not None:
                                        msg["breathing_rate"] = breathing_rate
                                    if blink_rate is not None:
                                        msg["blink_rate"] = blink_rate
                                    if posture_stress is not None:
                                        msg["posture_stress"] = posture_stress
                                    ws_broadcast_raw(msg)
                    except Exception as file_pred_err:
                        print(f"❌ File-based prediction error: {file_pred_err}")

                # Original log handling
                if line.startswith("Starting") or line.startswith("Capturing") or line.startswith("✅ Body posture calibrated") or line.startswith("✅ Face angle calibrated") or line.startswith("❌"):
                    send_log("new_log", line)
                elif line.startswith("⚠️ Bad posture detected!"):
                    send_log("bad_posture", line)
                elif line.startswith("📱 Suspicious!"):
                    send_log("phone_suspicion", line)
                elif line.startswith("✅ You're no longer"):
                    send_log("phone_suspicion", line)
                elif line.startswith("✅ Posture corrected!"):
                    send_log("bad_posture", line)
            except Exception as e:
                print(f"Log dispatch error: {e}")
        try:
            proc.stdout.close()
        except Exception:
            pass
        proc.wait()
        exit_code = proc.returncode
        print(f"⚠️ Agent exited ({exit_code})")
        send_log("new_log", f"⚠️ Agent exited ({exit_code})")
        
        # Auto-restart agent if it crashes (but not if manually stopped)
        if exit_code != 0 and exit_code != -2:  # -2 is SIGINT (Ctrl+C)
            print("🔄 Agent crashed, will auto-restart in 3 seconds...")
            import time
            time.sleep(3)
            
            # Clear the agent_thread to allow restart
            agent_thread = None
            
            # Restart the agent
            print("🔄 Auto-restarting agent...")
            start_agent(_data)

    agent_thread = threading.Thread(target=_run, daemon=True)
    agent_thread.start()
    print("✅ Agent thread started.")


async def ws_handler(ws: WebSocketServerProtocol):
    clients.add(ws)
    print(f"🔗 Client connected: {ws.remote_address}")
    global LAST_CLIENT_ID
    # Track a simple client_id for prediction routing
    try:
        LAST_CLIENT_ID = f"{ws.remote_address[0]}:{ws.remote_address[1]}"
    except Exception:
        LAST_CLIENT_ID = "unknown"
    connection_errors = 0
    max_connection_errors = 5
    
    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
                connection_errors = 0  # Reset error count on successful message
            except json.JSONDecodeError as e:
                connection_errors += 1
                print(f"🔸 JSON decode error (#{connection_errors}): {e} - Raw: {raw}")
                if connection_errors >= max_connection_errors:
                    print(f"❌ Too many JSON errors ({connection_errors}), disconnecting client")
                    break
                continue
            except Exception as e:
                connection_errors += 1
                print(f"🔸 Message processing error (#{connection_errors}): {e}")
                if connection_errors >= max_connection_errors:
                    print(f"❌ Too many connection errors ({connection_errors}), disconnecting client")
                    break
                continue

            msg_type = msg.get("type")
            payload = msg.get("payload") or {}
            
            print(f"📥 Received: {msg_type}")
            if payload and len(str(payload)) > 100:
                print(f"    Payload preview: {str(payload)[:100]}...")
            else:
                print(f"    Payload: {payload}")

            try:
                if msg_type == "ping":
                    await ws.send(json.dumps(_msg("pong", {"ts": payload.get("ts")})))
                elif msg_type == "control.start":
                    # Optionally take provided client id
                    cid = payload.get("client_id") or payload.get("clientId")
                    if cid:
                        LAST_CLIENT_ID = str(cid)
                    start_agent(payload)
                elif msg_type == "webrtc.offer":
                    asyncio.create_task(handle_offer(payload, ws))
                elif msg_type == "webrtc.candidate":
                    asyncio.create_task(handle_candidate(payload))
                else:
                    print(f"ℹ️ Unhandled msg: {msg_type}")
            except Exception as handler_error:
                print(f"⚠️ Error handling message type '{msg_type}': {handler_error}")
                # Don't disconnect for handler errors, just log and continue
                
    except Exception as ws_error:
        print(f"⚠️ WebSocket connection error: {ws_error}")
    finally:
        clients.discard(ws)
        print(f"🔗 Client disconnected: {ws.remote_address}")



async def ws_main() -> None:
    global MAIN_LOOP
    MAIN_LOOP = asyncio.get_running_loop()
    print(f"🔌 WebSocket server listening on ws://0.0.0.0:{WS_PORT}")
    async with websockets.serve(ws_handler, "0.0.0.0", WS_PORT, max_size=4 * 1024 * 1024):
        await asyncio.Future()

def main() -> None:
    try:
        asyncio.run(ws_main())
    except KeyboardInterrupt:
        print("⏹️ Shutting down...")
    finally:
        for pc in list(tcs):
            try:
                asyncio.run(pc.close())
            except Exception:
                pass
        if agent_thread and agent_thread.is_alive():
            agent_thread.join(timeout=2)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
