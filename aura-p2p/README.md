# Aura P2P Module

Модуль для P2P соединений в Aura Cloud Gaming Platform

## Features
- Поддержка libp2p с TCP/WebRTC транспортом
- HTTP сигналинг для WebRTC соединений
- Мониторинг сетевой статистики
- Полностью асинхронная реализация

## Basic Usage
```rust
let p2p = P2pService::new();
let stats = p2p.get_stats();
```

## WebRTC Support
```rust
let p2p = P2pService::with_webrtc(P2pConfig::default());
p2p.send(&peer_id, b"message").await?;
```

## API Endpoints

### P2P API
- `GET /p2p/peers` - Список подключенных пиров
- `GET /p2p/stats` - Сетевая статистика

### Signaling API
- `POST /signaling/offer` - Отправить SDP offer
- `POST /signaling/answer` - Отправить SDP answer
