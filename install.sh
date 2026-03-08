#!/bin/bash

# Local helper for building and installing this plugin from source.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Building plugin bundle..."
npm ci
npm run build

echo "Packing npm artifact..."
PACKAGE_TGZ="$(npm pack | tail -n 1)"
PACKAGE_PATH="$SCRIPT_DIR/$PACKAGE_TGZ"

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw command not found."
  echo "Build + package completed: $PACKAGE_PATH"
  echo "Install manually later with: openclaw plugins install $PACKAGE_PATH"
  exit 0
fi

echo "Installing plugin from package: $PACKAGE_PATH"
openclaw plugins install "$PACKAGE_PATH"

echo "Done."
