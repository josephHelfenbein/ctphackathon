import asyncio
import json
import logging
import os
import sys
import threading
import time
import subprocess
from typing import Any, Dict, Optional, Set

import cv2
import av
import websockets
from websockets.server import WebSocketServerProtocol

from dotenv import load_dotenv
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate

av.logging.set_level(av.logging.ERROR)

load_dotenv()


WS_PORT = int(os.getenv("WS_PORT", "8765"))

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

def ws_send_sync(msg_type: str, payload: Optional[Dict[str, Any]] = None) -> None:
    msg = json.dumps(_msg(msg_type, payload))
    for ws in clients:
        try:
            asyncio.get_event_loop().create_task(ws.send(msg))
        except Exception:
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
