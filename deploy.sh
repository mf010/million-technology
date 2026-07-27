#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Run this after `git pull` on the shared hosting terminal
# Usage: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

# Resolve the directory this script lives in (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "────────────────────────────────────────"
echo "  Million Technology — Deploy Script"
echo "────────────────────────────────────────"

# ── 1. Laravel: Install production dependencies ───────────────────────────────
echo ""
echo "[1/6] Installing Composer dependencies (no dev)..."
cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-interaction

# ── 2. Create .env if it doesn't exist ───────────────────────────────────────
echo ""
echo "[2/6] Checking .env file..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "  .env not found — copying from .env.example"
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo "  ⚠️  IMPORTANT: Edit backend/.env and fill in your DB credentials & APP_KEY!"
    echo "  Then run: php artisan key:generate"
    exit 1
else
    echo "  .env found ✓"
fi

# ── 3. Clear and cache config/routes for performance ─────────────────────────
echo ""
echo "[3/6] Caching configuration & routes..."
cd "$BACKEND_DIR"
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache

# ── 4. Run database migrations ────────────────────────────────────────────────
echo ""
echo "[4/6] Running database migrations..."
cd "$BACKEND_DIR"
php artisan migrate --force

# ── 5. Set storage permissions ────────────────────────────────────────────────
echo ""
echo "[5/6] Setting storage directory permissions..."
chmod -R 775 "$BACKEND_DIR/storage"
chmod -R 775 "$BACKEND_DIR/bootstrap/cache"

# ── 6. Create storage symlink (if not already done) ──────────────────────────
echo ""
echo "[6/6] Ensuring storage symlink exists..."
cd "$BACKEND_DIR"
if [ ! -L "$BACKEND_DIR/public/storage" ]; then
    php artisan storage:link
    echo "  Storage symlink created ✓"
else
    echo "  Storage symlink already exists ✓"
fi

echo ""
echo "────────────────────────────────────────"
echo "  ✅ Deploy complete!"
echo "  Site: https://milliontechnology.ly"
echo "  API:  https://milliontechnology.ly/api"
echo "────────────────────────────────────────"
