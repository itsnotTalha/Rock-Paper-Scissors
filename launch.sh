#!/bin/bash

# Rock Paper Scissors AI - Arcade Game Launcher
# This script starts both the backend and frontend servers

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           ROCK PAPER SCISSORS AI - ARCADE LAUNCHER            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill ${BACKEND_PID:-} ${FRONTEND_PID:-} 2>/dev/null || true
    echo -e "${YELLOW}Goodbye!${NC}"
}

trap cleanup EXIT

# Start Backend
echo -e "${BLUE}[1/2] Starting Backend (FastAPI)...${NC}"
cd "$PROJECT_DIR/backend"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

python3 main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 2

# Check if backend started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${YELLOW}Backend failed to start. Logs:${NC}"
    cat /tmp/backend.log
    exit 1
fi

# Start Frontend
echo -e "${BLUE}[2/2] Starting Frontend (Vite)...${NC}"
cd "$PROJECT_DIR/frontend"

if [ ! -x "node_modules/.bin/vite" ]; then
    echo -e "${YELLOW}Installing npm dependencies for this system...${NC}"
    npm ci
fi

npm run dev -- --strictPort > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3
if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${YELLOW}Frontend failed to start. Logs:${NC}"
    cat /tmp/frontend.log
    exit 1
fi
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "║${GREEN}              ✓ All servers running successfully!${NC}              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:8000"
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
