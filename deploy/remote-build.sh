#!/usr/bin/env bash
# Runs ON THE VPS. Installs deps, builds the Node-server bundle, restarts the service.
# Called by the GitHub Actions deploy workflow over SSH.
set -euo pipefail

cd /var/www/ferasha

echo "==> Installing dependencies (incl. dev deps needed for the build)"
# Use `npm install` (not `npm ci`): the committed lock file is generated on
# Windows and omits Linux-only optional deps (e.g. @emnapi/*), which makes the
# strict `npm ci` fail on the VPS. `npm install` reconciles those transparently.
npm install --include=dev --no-audit --no-fund

echo "==> Building production bundle (.output/server/index.mjs)"
npm run build

echo "==> Restarting service"
sudo systemctl restart ferasha

echo "==> Done. Recent service status:"
sudo systemctl --no-pager --lines=5 status ferasha || true
