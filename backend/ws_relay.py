import asyncio
import json
import websockets
from websockets.server import WebSocketServerProtocol

clients: set[WebSocketServerProtocol] = set()


async def handler(ws: WebSocketServerProtocol):
    clients.add(ws)
    try:
        async for message in ws:
            try:
                _ = json.loads(message)
            except Exception:
                continue

            to_drop = []
            for peer in clients:
                if peer is ws:
                    continue
                try:
                    await peer.send(message)
                except Exception:
                    to_drop.append(peer)
            for peer in to_drop:
                clients.discard(peer)
    finally:
        clients.discard(ws)


async def main():
    port = 8765
    print(f"🔌 WS relay listening on ws://localhost:{port}")
    async with websockets.serve(handler, "0.0.0.0", port, max_size=4 * 1024 * 1024):
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
