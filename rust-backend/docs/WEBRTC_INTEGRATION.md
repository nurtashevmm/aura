# WebRTC Integration Guide

## Architecture Overview
- Uses libp2p-webrtc-websys for browser-based WebRTC transport
- Falls back to TCP in native environments
- Automatic peer discovery via libp2p Kademlia DHT

## Configuration
```toml
[dependencies]
libp2p-webrtc-websys = { version = "0.1", features = ["websys"] }
```

## Requirements
- Modern browser with WebRTC support
- HTTPS for production deployments
- STUN/TURN servers for NAT traversal

## Testing
1. Build WASM module: `wasm-pack build --target web`
2. Serve via HTTPS for full WebRTC functionality
3. Check peer connections in browser console

## Troubleshooting
- ICE failures: Verify STUN/TURN server accessibility
- Signaling issues: Check libp2p swarm events
- WASM errors: Ensure proper crate-type in Cargo.toml
