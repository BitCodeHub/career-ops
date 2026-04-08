#!/usr/bin/env bash
set -euo pipefail

# career-ops setup script — bootstraps a new installation
# Run: ./setup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== career-ops setup ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }
step() { echo -e "\n--- Step $1: $2 ---"; }

ISSUES=0

# Step 1: Check Node.js
step 1 "Checking Node.js"
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version)
  ok "Node.js $NODE_VERSION"
else
  err "Node.js not found. Install from https://nodejs.org"
  ISSUES=$((ISSUES + 1))
fi

# Step 2: Install npm dependencies
step 2 "Installing npm dependencies"
if [[ -f package.json ]]; then
  npm install --silent 2>&1
  ok "npm dependencies installed"
else
  err "package.json not found"
  ISSUES=$((ISSUES + 1))
fi

# Step 3: Install Playwright browsers
step 3 "Checking Playwright"
if npx playwright --version &>/dev/null 2>&1; then
  ok "Playwright available"
  echo "    Checking Chromium..."
  if npx playwright install chromium 2>&1 | tail -1; then
    ok "Chromium browser ready"
  else
    warn "Could not install Chromium. PDF generation will not work."
    warn "Run manually: npx playwright install chromium"
  fi
else
  warn "Playwright not available. Run: npm install"
fi

# Step 4: Check user config files
step 4 "Checking configuration"

if [[ -f cv.md ]]; then
  ok "cv.md exists"
else
  warn "cv.md not found — you'll need to create this with your CV"
  echo "    Run career-ops and it will guide you through onboarding"
fi

if [[ -f config/profile.yml ]]; then
  ok "config/profile.yml exists"
else
  if [[ -f config/profile.example.yml ]]; then
    cp config/profile.example.yml config/profile.yml
    ok "Created config/profile.yml from example (edit with your details)"
  else
    err "config/profile.example.yml not found"
    ISSUES=$((ISSUES + 1))
  fi
fi

if [[ -f portals.yml ]]; then
  ok "portals.yml exists"
else
  if [[ -f templates/portals.example.yml ]]; then
    cp templates/portals.example.yml portals.yml
    ok "Created portals.yml from example (customize search keywords)"
  else
    err "templates/portals.example.yml not found"
    ISSUES=$((ISSUES + 1))
  fi
fi

# Step 5: Create data directories and files
step 5 "Setting up data directories"

mkdir -p data reports output jds batch/logs batch/tracker-additions

if [[ ! -f data/applications.md ]]; then
  cat > data/applications.md <<'EOF'
# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
EOF
  ok "Created data/applications.md"
else
  ok "data/applications.md exists"
fi

if [[ ! -f data/pipeline.md ]]; then
  cat > data/pipeline.md <<'EOF'
# Pipeline — Job Offer Inbox

## Pending

<!-- Add URLs here: - [ ] https://... | Company | Role -->

## Processed

<!-- Processed URLs move here automatically -->
EOF
  ok "Created data/pipeline.md"
else
  ok "data/pipeline.md exists"
fi

if [[ ! -f data/scan-history.tsv ]]; then
  printf 'url\tfirst_seen\tportal\ttitle\tcompany\tstatus\n' > data/scan-history.tsv
  ok "Created data/scan-history.tsv"
else
  ok "data/scan-history.tsv exists"
fi

# Step 6: Check Go (for dashboard, optional)
step 6 "Checking Go (optional, for TUI dashboard)"
if command -v go &>/dev/null; then
  GO_VERSION=$(go version | awk '{print $3}')
  ok "Go $GO_VERSION"
  echo "    Building dashboard..."
  if (cd dashboard && go build -o career-dashboard . 2>&1); then
    ok "Dashboard built: dashboard/career-dashboard"
  else
    warn "Dashboard build failed — check Go dependencies"
  fi
else
  warn "Go not found. Dashboard won't be available (optional)."
  echo "    Install from https://go.dev/dl/"
fi

# Step 7: Run health checks
step 7 "Running health checks"
echo ""
node cv-sync-check.mjs 2>&1 || true
echo ""
node verify-pipeline.mjs 2>&1 || true

# Summary
echo ""
echo "=================================="
if [[ $ISSUES -eq 0 ]]; then
  echo -e "${GREEN}Setup complete!${NC}"
else
  echo -e "${YELLOW}Setup complete with $ISSUES issue(s).${NC}"
fi
echo ""
echo "Next steps:"
echo "  1. Edit config/profile.yml with your personal details"
echo "  2. Create cv.md with your CV in markdown format"
echo "  3. Customize portals.yml with your target companies"
echo "  4. Run: claude and paste a job URL to evaluate"
echo ""
echo "Available commands:"
echo "  npm run verify     — Health check pipeline integrity"
echo "  npm run merge      — Merge batch tracker additions"
echo "  npm run normalize  — Fix non-canonical statuses"
echo "  npm run dedup      — Remove duplicate entries"
echo "  npm run sync-check — Validate config consistency"
echo "  npm run pdf        — Generate PDF from HTML"
echo ""
echo "TUI Dashboard (requires Go):"
echo "  cd dashboard && ./career-dashboard --path .."
echo "=================================="
