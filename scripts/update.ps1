<#
Aura Play Agent Update Script

Downloads latest aura-agent.exe from Aura CDN/GitHub and restarts Windows service
Usage: run as Administrator on merchant PC
#>

$ErrorActionPreference = 'Stop'
function Write-Log { param([string]$m) ; Write-Host "[AuraUpdate] $m" }

# Config
$downloadUrl = "https://cdn.auraplay.gg/agent/latest/aura-agent.exe"
$agentPath = "C:\AuraPlayHost\aura-agent.exe"
$serviceName = "AuraAgent"

Write-Log "Downloading latest agent…"
Invoke-WebRequest -Uri $downloadUrl -OutFile "$agentPath.new"

Write-Log "Stopping service…"
Stop-Service -Name $serviceName -Force

Write-Log "Replacing binary…"
Move-Item -Force "$agentPath.new" $agentPath

Write-Log "Starting service…"
Start-Service -Name $serviceName

Write-Log "Update complete."
