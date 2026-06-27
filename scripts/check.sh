#!/usr/bin/env bash
# Full local verification for Linux/macOS. Run: bash scripts/check.sh
# Runs every quality gate the CI runs and stops at the first failure.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> pnpm install"
pnpm install

echo "==> lint"
pnpm run lint

echo "==> test"
pnpm run test

echo "==> typecheck"
pnpm run typecheck

echo "==> build"
pnpm run build

echo "✅ All checks passed"
