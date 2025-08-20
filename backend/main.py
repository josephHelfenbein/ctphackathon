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
                        await asyncio.to_thread(cv2.imwrite, latest_frame_path, img)
                        
                        if frame_count % 100 == 1:
                            print(f"� Frame #{frame_count} saved ({img.shape})")
                        
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


async def handle_candidate(payload: Dict[str, Any]) -> None:
    candidate_str = payload.get("candidate")
    sdp_mid = payload.get("sdpMid")
    sdp_mline_index = payload.get("sdpMLineIndex")
    
    if not candidate_str:
        print("⚠️ No candidate string provided")
        return
    
    try:
        parts = candidate_str.split()
        if len(parts) < 8 or not parts[0].startswith("candidate:"):
            print(f"⚠️ Invalid candidate format: {candidate_str}")
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
        
        for pc in list(tcs):
            try:
                await pc.addIceCandidate(cand)
            except Exception as e:
                print(f"ICE add failed on pc {id(pc)}: {e}")
                
    except (ValueError, IndexError) as e:
        print(f"⚠️ Failed to parse candidate '{candidate_str}': {e}")


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
        print(f"⚠️ Agent exited ({proc.returncode})")
        send_log("new_log", f"⚠️ Agent exited ({proc.returncode})")

    agent_thread = threading.Thread(target=_run, daemon=True)
    agent_thread.start()
    print("✅ Agent thread started.")


async def ws_handler(ws: WebSocketServerProtocol):
    clients.add(ws)
    print(f"🔗 Client connected: {ws.remote_address}")
    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except Exception:
                print(f"🔸 Non-JSON message: {raw}")
                continue

            msg_type = msg.get("type")
            payload = msg.get("payload") or {}

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
