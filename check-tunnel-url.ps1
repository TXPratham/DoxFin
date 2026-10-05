# Checks the currently active tunnel URL without restarting it
$tasks = Get-ChildItem "$HOME\.gemini\antigravity-ide\brain\*\.system_generated\tasks\*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

$found = $false
foreach ($t in $tasks) {
    $content = Get-Content $t.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "(https://[a-zA-Z0-9\-]+\.trycloudflare\.com)") {
        Write-Host "`nCurrently Active Cloudflare Tunnel URL:" -ForegroundColor Green
        Write-Host $matches[1] -ForegroundColor Yellow
        Write-Host "`n(Found in: $($t.Name))`n" -ForegroundColor Gray
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "No active Cloudflare quick tunnel log found. Run .\start-tunnel.ps1 to start a new one." -ForegroundColor Yellow
}
