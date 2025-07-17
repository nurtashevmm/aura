# TLS Setup for Aura Backend (Production)

Aura backend already supports HTTPS via `rustls`. You only need to provide paths to `tls.cert_file` and `tls.key_file` in `config/tls.toml`. There are two supported approaches:

---

## 1. Automatic – **Let’s Encrypt + Certbot** (recommended)

1. **Install Certbot**
   ```sh
   sudo apt-get update && sudo apt-get install -y certbot
   ```
2. **Obtain certificate** (replace `example.com`):
   ```sh
   sudo certbot certonly --standalone -d example.com -m you@example.com --agree-tos --non-interactive
   ```
   Certs are stored under `/etc/letsencrypt/live/example.com/`.
3. **Configure Aura**
   ```toml
   # config/tls.toml
   tls.cert_file = "/etc/letsencrypt/live/example.com/fullchain.pem"
   tls.key_file  = "/etc/letsencrypt/live/example.com/privkey.pem"
   ```
4. **Auto-renew** – Certbot sets up a `systemd` timer; verify with `sudo systemctl list-timers certbot*`.

---

## 2. Manual – Upload PEM files

1. Place your `fullchain.pem` and `privkey.pem` anywhere on the server (e.g. `/opt/aura/tls/`).
2. Update `config/tls.toml` with absolute paths.
3. **Reload** the systemd service hosting Aura to pick up new certs.

```
[Unit]
Description=Aura Backend
After=network.target

[Service]
ExecStart=/opt/aura/bin/aura-backend --config /opt/aura/config/prod.toml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
Restart with:
```sh
sudo systemctl restart aura-backend
```

---

### Testing
- Local: `curl -v https://localhost:8080/health` (add `--insecure` if self-signed).
- Remote: use SSL Labs: <https://www.ssllabs.com/ssltest/>.

> **Tip:** For local development, generate self-signed certs: `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=localhost"`.
