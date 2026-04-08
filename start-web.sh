#!/usr/bin/env bash
set -euo pipefail

# Career-Ops Web App — Start with ngrok tunnel
# Run this on your Mac Mini: ./start-web.sh
# Requires: Node.js, ngrok (authenticated with your paid account)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$SCRIPT_DIR/web"

echo "=== Career Ops Web App ==="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v ngrok >/dev/null 2>&1 || { echo "ERROR: ngrok not found. Install from https://ngrok.com/download"; exit 1; }

# Install dependencies if needed
if [ ! -d "$WEB_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  cd "$WEB_DIR" && npm install
fi

# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Next.js dev server in background
echo "Starting Next.js on port 3000..."
cd "$WEB_DIR" && npm run dev -- --port 3000 &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for server..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 1
done
echo "Next.js is ready!"

# Start ngrok tunnel
echo ""
echo "Starting ngrok tunnel..."
ngrok http 3000 &
NGROK_PID=$!

# Wait for ngrok to initialize and get the URL
sleep 3
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null || echo "")

if [ -z "$NGROK_URL" ]; then
  sleep 2
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null || echo "Check http://localhost:4040 for your ngrok URL")
fi

echo ""
echo "========================================"
echo "  Career Ops is LIVE!"
echo ""
echo "  Local:  http://localhost:3000"
echo "  Public: $NGROK_URL"
echo ""
echo "  Press Ctrl+C to stop"
echo "========================================"

# Handle shutdown
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $DEV_PID 2>/dev/null || true
  kill $NGROK_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Keep running
wait
