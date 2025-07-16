# P2P API Documentation (v2)

## Key Features
- libp2p core with TCP/WebRTC transports
- Peer discovery and management
- Real-time network monitoring
- WebRTC signaling endpoints

## Basic Usage
```rust
let config = P2pConfig::default();
let p2p_service = P2pService::with_config(config);
```

## WebRTC Setup
```rust
let p2p = P2pService::with_webrtc(P2pConfig {
    listen_port: 0, // random port
    ..Default::default()
});
```
