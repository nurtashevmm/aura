# Deployment Guide

## Backend Deployment

1. Build artifacts:
```bash
cd rust-backend
cargo build --release
```

2. Run migrations:
```bash
DATABASE_URL=postgres://user:pass@localhost/aura ./target/release/aura-backend migrate
```

3. Start service:
```bash
DATABASE_URL=postgres://user:pass@localhost/aura \
  RUST_LOG=info \
  ./target/release/aura-backend
```

## Frontend Deployment

1. Build production bundle:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
vercel --prod
```

## Monitoring

Health check endpoints:
- `GET /api/health` - Basic service health
- `GET /api/health/db` - Database connectivity
- `GET /api/health/p2p` - P2P network status (if enabled)
- `GET /api/health/full` - Comprehensive system status

### Alerting
Configure alerts for:
- HTTP status != 200 on health endpoints
- Response time > 500ms
- Database connection failures
- P2P peer count == 0 (if enabled)
