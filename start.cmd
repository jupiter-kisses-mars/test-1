@echo off
echo Starting TripMate Backend and Frontend...

:: Start FastAPI Backend in a new window
start "TripMate Backend (FastAPI)" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload --port 8000"

:: Start Vite Frontend in a new window
start "TripMate Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both services started!
echo Backend Docs: http://localhost:8000/docs
echo Frontend App: http://localhost:5173
