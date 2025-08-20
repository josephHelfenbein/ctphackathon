"use client";
import React from "react";

type WsMsg = { type: string; payload?: any };

export default function Home() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = React.useState<string>("idle");
  const [wsUrl, setWsUrl] = React.useState<string>("");

  const connect = React.useCallback(async () => {
    setStatus("fetching-ws-url");
    try {
      const resp = await fetch("/api/ws-url");
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to get WS URL");
      setWsUrl(data.wsUrl as string);
      const ws = new WebSocket(data.wsUrl as string);
      wsRef.current = ws;
      setStatus("ws-connecting");

      ws.onopen = () => {
        setStatus("ws-open");
      };

      ws.onmessage = async (e) => {
        const msg: WsMsg = JSON.parse(e.data);
        if (msg.type === "webrtc.answer") {
          const pc = pcRef.current;
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          setStatus("webrtc-connected");
        } else if (msg.type?.startsWith("logs.")) {
          console.log("log:", msg.payload?.message);
        }
      };
      ws.onclose = () => setStatus("ws-closed");
      ws.onerror = () => setStatus("ws-error");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.onicecandidate = (ev) => {
        if (ev.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          const msg: WsMsg = { type: "webrtc.candidate", payload: ev.candidate.toJSON() };
          wsRef.current.send(JSON.stringify(msg));
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const offerMsg: WsMsg = { type: "webrtc.offer", payload: offer };
      ws.send(JSON.stringify(offerMsg));
      ws.send(JSON.stringify({ type: "control.start", payload: {} } satisfies WsMsg));

    } catch (err: any) {
      console.error(err);
      setStatus("error: " + err?.message);
    }
  }, []);

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">WebRTC + WebSocket Demo</h1>
      <div className="space-x-2">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={connect}
          disabled={status !== "idle" && status !== "ws-closed"}
        >
          Connect
        </button>
        <span className="text-sm text-gray-600">{status}{wsUrl ? ` | ${wsUrl}` : ""}</span>
      </div>
      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded border" />
      <p className="text-sm text-gray-500">
        This page opens a WebSocket to your backend, performs a WebRTC offer, and sends ICE candidates. The backend
        responds with an answer and starts the agent once frames begin arriving.
      </p>
    </main>
  );
}
