#!/usr/bin/env bash
# Runs ON THE VPS. Installs deps, builds the Node-server bundle, restarts the service.
# Called by the GitHub Actions deploy workflow over SSH.
set -euo pipefail

cd /var/www/ferasha

echo "==> Installing dependencies (incl. dev deps needed for the build)"
npm ci --include=dev

echo "==> Building production bundle (.output/server/index.mjs)"
npm run build

echo "==> Restarting service"
sudo systemctl restart ferasha

echo "==> Done. Recent service status:"
sudo systemctl --no-pager --lines=5 status ferasha || true
