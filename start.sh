#!/bin/bash
# Starter Script for Linux/macOS / Git Bash
echo "Starting Backend and Frontend..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/venv/Scripts/python.exe" ]; then
    PYTHON_CMD="$SCRIPT_DIR/venv/Scripts/python.exe"
elif [ -f "$SCRIPT_DIR/venv/bin/python" ]; then
    PYTHON_CMD="$SCRIPT_DIR/venv/bin/python"
else
    PYTHON_CMD="python"
fi

# Start FastAPI Backend in background
cd "$SCRIPT_DIR/backend"
"$PYTHON_CMD" -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

# Start Vite Frontend
cd "$SCRIPT_DIR/frontend"
npm run dev

# Kill backend when frontend stops
kill $BACKEND_PID
