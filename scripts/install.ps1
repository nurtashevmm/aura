<#
Aura Play Merchant Onboarding Script

This PowerShell script installs and configures all dependencies for hosting games with Aura Play on Windows:
 1. Installs Tailscale (silent) and opens the login window
 2. Installs Sunshine (silent)
 3. Copies the Aura Agent binary next to Sunshine and registers it as a Windows service
 4. Generates agent.json with a random secret key
 5. Opens Windows Firewall for Sunshine & Agent localhost ports
 6. Cleans up temporary files

Usage:
 1. Download the ZIP provided by Aura Play and extract it
 2. Right-click install.ps1 → Run with PowerShell **as Administrator**
 3. Log in to Tailscale when prompted.
#>

param(
    [string]$TailscaleVersion = "stable",
    [string]$SunshineVersion = "2025.628.4510"
)

function Write-Log {
    param([string]$msg)
    Write-Host "[AuraInstall] $msg"
}

# Ensure running as admin
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Запустите PowerShell от имени администратора!"
    exit 1
}

$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$installRoot = "C:\AuraPlayHost"
if (-not (Test-Path $installRoot)) { New-Item -ItemType Directory -Path $installRoot | Out-Null }
Set-Location $installRoot

# 1. Install Tailscale
$tailscaleExeCandidates = @(
    "$env:ProgramFiles\Tailscale IPN\tailscale.exe",
    "$env:ProgramFiles\Tailscale\tailscale.exe",
    "$env:ProgramFiles(x86)\Tailscale IPN\tailscale.exe",
    "$env:ProgramFiles(x86)\Tailscale\tailscale.exe"
)
$tailscaleExe = $tailscaleExeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $tailscaleExe) {
    Write-Log "Downloading Tailscale…"
    $taiUrl = "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe"
    Invoke-WebRequest -Uri $taiUrl -OutFile tailscale-setup.exe
    Write-Log "Installing Tailscale…"
    Start-Process -FilePath .\tailscale-setup.exe -ArgumentList "/qn" -Wait
    Remove-Item tailscale-setup.exe
}
Write-Log "Running tailscale up (interactive)…"
if ($tailscaleExe) { & $tailscaleExe up } else { Write-Log "Tailscale executable not found. Please run Tailscale manually and login, then rerun the script."; exit 1 }

# 2. Install Sunshine
Write-Log "Downloading Sunshine $SunshineVersion…"
$ssUrl = "https://github.com/LizardByte/Sunshine/releases/download/v$SunshineVersion/sunshine-windows-installer.exe"
Invoke-WebRequest -Uri $ssUrl -OutFile sunshine-windows-installer.exe
Write-Log "Installing Sunshine…"
Start-Process -FilePath .\sunshine-windows-installer.exe -ArgumentList "/S" -Wait
Remove-Item .\sunshine-windows-installer.exe

# 3. Deploy Aura Agent
Write-Log "Copying Aura Agent…"
Copy-Item "$scriptDir\aura-agent.exe" "$installRoot\aura-agent.exe" -Force

# 4. Generate config
$secret = [System.Convert]::ToHexString((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
$agentCfg = @{ secret = $secret; sunshineCliPath = "C:\Program Files\Sunshine\sunshine-cli.exe"; listenAddr = ":8800" }
$agentCfg | ConvertTo-Json | Out-File "$installRoot\agent.json" -Encoding UTF8

# 5. Register service (using NSSM bundled)
Write-Log "Registering Windows service AuraAgent…"
$nssm = "$scriptDir\\nssm.exe"
if (-not (Test-Path $nssm)) {
    Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile nssm.zip
    Expand-Archive nssm.zip -DestinationPath . -Force
    $nssm = (Get-ChildItem -Recurse -Filter nssm.exe | Select-Object -First 1).FullName
}
& $nssm install AuraAgent "$installRoot\aura-agent.exe" service
& $nssm set AuraAgent Start SERVICE_AUTO_START
& $nssm start AuraAgent

# 6. Firewall rule (local only)
Write-Log "Adding firewall rule for Aura Agent port 8800 (Localhost)…"
New-NetFirewallRule -DisplayName "AuraAgentLocal" -Direction Inbound -LocalAddress 127.0.0.1 -LocalPort 8800 -Protocol TCP -Action Allow -Profile Any -EdgeTraversalPolicy Block -ErrorAction SilentlyContinue

Write-Log "Installation complete!"
Write-Log "Save this secret and add it to the machine record in Aura backend: $secret"
