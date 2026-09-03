@echo off
echo Starting Backend and Frontend...

:: Start FastAPI Backend in a new window using venv python if available
if exist "%~dp0venv\Scripts\python.exe" (
    start "Expense Calculator & TripMate Backend (FastAPI)" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"
) else (
    start "Expense Calculator & TripMate Backend (FastAPI)" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload --port 8000"
)

:: Start Vite Frontend in a new window
start "Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both services started!
echo Backend Docs: http://localhost:8000/docs
echo Frontend App: http://localhost:5173
