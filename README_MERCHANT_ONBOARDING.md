# Aura Play – Merchant Onboarding Kit (Windows)

This guide explains how to prepare and deploy a host PC for Aura Play cloud-gaming.

## Contents

```
agent/                 – aura-agent source (Go)
scripts/install.ps1    – one-click installation script (run as Admin)
scripts/update.ps1     – upgrade agent binary in place
agent.json.example     – config template
```

## Quick start (recommended)

1. **Download the prepared ZIP** sent by Aura (contains `aura-agent.exe`).
2. Unzip on the Windows host (e.g. `C:\AuraKit`).
3. *Run PowerShell as Administrator* in that folder:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
   .\scripts\install.ps1
   ```
4. A Tailscale login window appears – sign in with the merchant account.
5. Installation finishes; PowerShell prints a `secret = <hex>`.  
   Copy this value into the **Machine → Agent Secret** field in Aura’s admin panel together with the machine’s Tailscale IP shown by `tailscale ip -4`.
6. Done – the PC is now ready to serve sessions!  Players will receive one-time PINs automatically.

## Building `aura-agent.exe` yourself (macOS/Linux)

If you prefer/need to build from source:

1. Install Go ≥1.21 (`brew install go` or from https://go.dev/dl/).
2. In the project root run:

   ```bash
   GOOS=windows GOARCH=amd64 go build -o dist/kit/aura-agent.exe ./agent
   ```
3. Copy `agent.json.example` and `scripts/` into `dist/kit/` then create the archive:

   ```bash
   cp agent/agent.json.example dist/kit/
   cp -R scripts dist/kit/
   cd dist && zip -r aura-merchant-kit.zip kit
   ```
4. Transfer `aura-merchant-kit.zip` to the Windows machine and follow **Quick start**.

## Updating the agent

On the host PC run PowerShell as Admin:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\update.ps1
```

The script stops the Windows service, downloads the latest binary from Aura CDN, replaces the file, and restarts the service.

## Troubleshooting

* **Agent port 8800 unreachable** – ensure Windows Firewall rule `AuraAgentLocal` exists (run `install.ps1` again).
* **Player can’t connect (Moonlight PIN invalid)** – check `C:\ProgramData\AuraAgent\logs` (future feature) or run:
  ```powershell
  curl http://127.0.0.1:8800/health
  ```
  It should return `{ "ok": true }`.
* **Tailscale IP not shown in Aura admin** – make sure the machine is connected (`tailscale status`).

For help ping support@auraplay.gg.
