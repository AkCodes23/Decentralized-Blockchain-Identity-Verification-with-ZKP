# Proxy starter to run the root startup script from the backend directory

$root = Join-Path $PSScriptRoot '..'
$script = Join-Path $root 'start-everything.ps1'

if (-not (Test-Path $script)) {
    Write-Host "Root script not found at: $script" -ForegroundColor Red
    exit 1
}

& powershell -NoProfile -ExecutionPolicy Bypass -File $script @args


