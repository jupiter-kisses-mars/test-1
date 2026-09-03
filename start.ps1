# Expense Calculator & TripMate PowerShell Starter Script
Write-Host "Starting Backend and Frontend..." -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPython = "$ScriptDir\venv\Scripts\python.exe"

# Start FastAPI Backend in a new window using venv python if available
if (Test-Path $VenvPython) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; & '$VenvPython' -m uvicorn main:app --reload --port 8000"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; uvicorn main:app --reload --port 8000"
}

# Start Vite Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host "Both services started in separate windows!" -ForegroundColor Cyan
Write-Host "Backend Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Yellow
