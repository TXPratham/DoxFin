# DoxFin One-Click Public Tunnel Launcher
# Runs Cloudflare tunnel and automatically outputs & copies your live URL

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "      DoxFin Live Tunnel Launcher       " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if local servers are running
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if (-not $frontend) {
    Write-Host "[!] Frontend is not running on port 3000. Start it with: cd frontend; npm run dev" -ForegroundColor Yellow
}
if (-not $backend) {
    Write-Host "[!] Backend is not running on port 8000. Start it with: .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --port 8000" -ForegroundColor Yellow
}

Write-Host "`nStarting Cloudflare Tunnel to http://localhost:3000..." -ForegroundColor Green
$logFile = "$PSScriptRoot\tunnel.log"
if (Test-Path $logFile) { Remove-Item $logFile -Force }

$process = Start-Process -FilePath "cloudflared" -ArgumentList "tunnel --url http://localhost:3000" -RedirectStandardError $logFile -PassThru -NoNewWindow

Write-Host "Connecting to Cloudflare edge network..." -NoNewline
$url = ""
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "https://[a-zA-Z0-9\-]+\.trycloudflare\.com") {
            $url = $matches[0]
            break
        }
    }
}

Write-Host ""
if ($url) {
    Write-Host "`n===========================================================" -ForegroundColor Green
    Write-Host "  YOUR LIVE DOXFIN URL:" -ForegroundColor Green
    Write-Host "  $url" -ForegroundColor Yellow
    Write-Host "===========================================================`n" -ForegroundColor Green
    Set-Clipboard -Value $url -ErrorAction SilentlyContinue
    Write-Host "[i] Copied to clipboard! Press Ctrl+C in this terminal when you want to stop the tunnel." -ForegroundColor Cyan
    $process.WaitForExit()
} else {
    Write-Host "`nFailed to retrieve URL within 30s. Check tunnel.log for details." -ForegroundColor Red
}
