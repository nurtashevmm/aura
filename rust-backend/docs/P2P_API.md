# P2P API Documentation

## Endpoints

### List Connected Peers
`GET /api/p2p/peers`

Returns:
```json
["12D3KooW...", "12D3KooW..."]
```

### Get Peer Count
`GET /api/p2p/peers/count`

Returns:
```json
2
```

### Get Network Stats
`GET /api/p2p/stats`

Returns:
```json
{
  "bytes_sent": 1024,
  "bytes_received": 2048,
  "ping_latency": 12.5
}
```

### Get Bandwidth Stats
`GET /api/p2p/stats/bandwidth`

Returns:
```json
[1024, 2048]
```

## WebRTC Integration

The P2P service automatically uses WebRTC transport when running in WASM/browser environments, falling back to TCP in native environments.

**Configuration:**
- WebRTC: Enabled by default for WASM targets
- ICE Servers: Uses browser defaults
- Signaling: Handled via libp2p protocol

**Requirements:**
- Browser with WebRTC support
- HTTPS for production (required by WebRTC)
