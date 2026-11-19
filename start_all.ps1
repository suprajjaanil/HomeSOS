# HomeSOS One-Click Launcher for PowerShell
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Launching HomeSOS - Voice-First AI Service Dispatcher" -ForegroundColor Yellow
Write-Host "ECHO Track Hackathon Solution" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; python backend\run.py"
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev"

Write-Host "HomeSOS services started successfully:" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Swagger:  http://localhost:8000/docs" -ForegroundColor White
