# TripMate Starter Script for Linux/macOS / Git Bash
echo "Starting TripMate Backend and Frontend..."

# Start FastAPI Backend in background
cd "$(dirname "$0")/backend"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

# Start Vite Frontend
cd "../frontend"
npm run dev

# Kill backend when frontend stops
kill $BACKEND_PID
