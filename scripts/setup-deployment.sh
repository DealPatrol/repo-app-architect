#!/usr/bin/env bash
# setup-deployment.sh — one-shot deployment setup for CodeVault
# Usage: bash scripts/setup-deployment.sh

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── 1. Check required tools ──────────────────────────────────────────────────

info "Checking required tools…"

command -v node  >/dev/null 2>&1 || error "node is not installed. Install it from https://nodejs.org"
command -v pnpm  >/dev/null 2>&1 || { warn "pnpm not found — installing via corepack…"; corepack enable && corepack prepare pnpm@latest --activate; }
command -v vercel >/dev/null 2>&1 || { info "vercel CLI not found — installing globally…"; pnpm add -g vercel@latest; }

success "node $(node -v), pnpm $(pnpm -v), vercel $(vercel --version 2>/dev/null | head -1)"

# ─── 2. Install project dependencies ─────────────────────────────────────────

info "Installing dependencies…"
cd "$REPO_ROOT"
pnpm install --frozen-lockfile
success "Dependencies installed."

# ─── 3. Create .env.local from .env.example ──────────────────────────────────

if [[ ! -f "$REPO_ROOT/.env.local" ]]; then
  cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env.local"
  success ".env.local created from .env.example."
  warn "Open .env.local and fill in your real values before continuing."
  echo ""
  echo "  Required variables:"
  echo "    DATABASE_URL          — Neon PostgreSQL connection string"
  echo "    GITHUB_CLIENT_ID      — GitHub OAuth App client ID"
  echo "    GITHUB_CLIENT_SECRET  — GitHub OAuth App client secret"
  echo "    NEXT_PUBLIC_APP_URL   — Your app URL (e.g. https://yourapp.vercel.app)"
  echo "    OPENAI_API_KEY        — OpenAI API key"
  echo "    ANTHROPIC_API_KEY     — Anthropic API key"
  echo ""
  read -r -p "Press Enter once you have edited .env.local, or Ctrl-C to abort…"
else
  success ".env.local already exists — skipping copy."
fi

# ─── 4. Load DATABASE_URL for migration ──────────────────────────────────────

# shellcheck disable=SC1091
set -a; source "$REPO_ROOT/.env.local"; set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  warn "DATABASE_URL is not set in .env.local — skipping database migration."
else
  info "Running database migration (scripts/01-create-schema.sql)…"
  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -f "$REPO_ROOT/scripts/01-create-schema.sql"
    success "Database schema applied."
  else
    warn "psql not found. Run the migration manually:"
    echo "  psql \"\$DATABASE_URL\" -f scripts/01-create-schema.sql"
    echo "  Or paste scripts/01-create-schema.sql directly in the Neon console."
  fi
fi

# ─── 5. Link Vercel project ───────────────────────────────────────────────────

info "Linking Vercel project…"
vercel link --yes
VERCEL_JSON="$REPO_ROOT/.vercel/project.json"

if [[ -f "$VERCEL_JSON" ]]; then
  ORG_ID=$(node -p "require('$VERCEL_JSON').orgId")
  PROJECT_ID=$(node -p "require('$VERCEL_JSON').projectId")
  success "Vercel project linked."
else
  warn ".vercel/project.json not found — Vercel link may have failed."
  ORG_ID="<run: cat .vercel/project.json | jq .orgId>"
  PROJECT_ID="<run: cat .vercel/project.json | jq .projectId>"
fi

# ─── 6. Pull Vercel environment ───────────────────────────────────────────────

info "Pulling Vercel environment variables…"
vercel env pull --yes "$REPO_ROOT/.env.local.vercel" || warn "Could not pull Vercel env — set variables in Vercel dashboard manually."

# ─── 7. Summary ──────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN} Setup complete! Next steps:${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Set environment variables in the Vercel dashboard:"
echo "   https://vercel.com/dashboard → your project → Settings → Environment Variables"
echo ""
echo "   DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,"
echo "   NEXT_PUBLIC_APP_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY"
echo ""
echo "2. Add these GitHub repository secrets for CI deploys"
echo "   (Settings → Secrets and variables → Actions):"
echo ""
echo "   VERCEL_TOKEN      — vercel.com/account/tokens"
echo "   VERCEL_ORG_ID     — ${ORG_ID}"
echo "   VERCEL_PROJECT_ID — ${PROJECT_ID}"
echo ""
echo "3. Update your GitHub OAuth App callback URL:"
echo "   https://github.com/settings/developers"
echo "   Authorization callback URL:"
echo "   \${NEXT_PUBLIC_APP_URL}/api/auth/github/callback"
echo ""
echo "4. Start the dev server:"
echo "   pnpm dev"
echo ""
