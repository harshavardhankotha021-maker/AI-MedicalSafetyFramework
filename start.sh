#!/bin/bash
# ── JeevanRaksha – Start both backend + frontend ──────────────────────────
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       JeevanRaksha AI Medical Safety System       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# 1. Start FastAPI backend
echo "▶ Starting FastAPI backend on http://localhost:8000 …"
cd "$REPO_ROOT"
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

# 2. Start Vite frontend
echo ""
echo "▶ Starting Vite frontend on http://localhost:5173 …"
cd "$REPO_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "─────────────────────────────────────────────────────"
echo "  🌐  Frontend:  http://localhost:5173"
echo "  🔌  Backend:   http://localhost:8000"
echo "  📖  API Docs:  http://localhost:8000/docs"
echo "─────────────────────────────────────────────────────"
echo "  Press Ctrl+C to stop both servers."
echo ""

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
