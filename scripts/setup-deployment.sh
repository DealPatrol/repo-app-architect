#!/usr/bin/env bash
set -euo pipefail

# ── colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[info]${NC}  $*"; }
success() { echo -e "${GREEN}[ok]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC}  $*"; }
die()     { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

# ── prereq check ───────────────────────────────────────────────────────────────
check_cmd() {
  command -v "$1" &>/dev/null || die "'$1' not found. Install it first:  $2"
}

check_cmd vercel "npm install -g vercel"
check_cmd gh     "https://cli.github.com"
check_cmd jq     "brew install jq  /  apt install jq"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       CodeVault — deployment setup           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── helpers ────────────────────────────────────────────────────────────────────
prompt_secret() {
  local var_name="$1" prompt_text="$2" value=""
  while [[ -z "$value" ]]; do
    read -rsp "${prompt_text}: " value; echo ""
    [[ -z "$value" ]] && warn "Value cannot be empty, try again."
  done
  printf -v "$var_name" '%s' "$value"
}

prompt_plain() {
  local var_name="$1" prompt_text="$2" default="${3:-}" value=""
  read -rp "${prompt_text}${default:+ [$default]}: " value
  value="${value:-$default}"
  [[ -z "$value" ]] && die "Value cannot be empty."
  printf -v "$var_name" '%s' "$value"
}

# ── step 1: vercel login & link ────────────────────────────────────────────────
info "Step 1/5 — Vercel login & project link"

vercel whoami &>/dev/null || { info "Not logged in to Vercel — opening browser…"; vercel login; }
success "Vercel authenticated as: $(vercel whoami)"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f ".vercel/project.json" ]]; then
  info "Linking this directory to a Vercel project…"
  vercel link --yes
else
  info "Already linked to Vercel project."
fi

VERCEL_ORG_ID="$(jq -r '.orgId' .vercel/project.json)"
VERCEL_PROJECT_ID="$(jq -r '.projectId' .vercel/project.json)"

[[ "$VERCEL_ORG_ID" == "null" || -z "$VERCEL_ORG_ID" ]]       && die "Could not read orgId from .vercel/project.json"
[[ "$VERCEL_PROJECT_ID" == "null" || -z "$VERCEL_PROJECT_ID" ]] && die "Could not read projectId from .vercel/project.json"

success "Vercel org: $VERCEL_ORG_ID"
success "Vercel project: $VERCEL_PROJECT_ID"

# ── step 2: collect a vercel token ────────────────────────────────────────────
echo ""
info "Step 2/5 — Vercel API token"
echo "  Create one at: https://vercel.com/account/tokens"
prompt_secret VERCEL_TOKEN "  Paste your Vercel token"

# ── step 3: collect app env vars ──────────────────────────────────────────────
echo ""
info "Step 3/5 — App environment variables"

prompt_plain  DATABASE_URL       "  DATABASE_URL (Neon PostgreSQL)"
prompt_plain  GITHUB_CLIENT_ID   "  GITHUB_CLIENT_ID"
prompt_secret GITHUB_CLIENT_SECRET "  GITHUB_CLIENT_SECRET"
prompt_plain  APP_URL            "  NEXT_PUBLIC_APP_URL (e.g. https://codevault.vercel.app)"
prompt_secret OPENAI_API_KEY     "  OPENAI_API_KEY"
prompt_secret ANTHROPIC_API_KEY  "  ANTHROPIC_API_KEY"

NEXT_PUBLIC_APP_URL="$APP_URL"

# ── step 4: set GitHub secrets ────────────────────────────────────────────────
echo ""
info "Step 4/5 — Setting GitHub repository secrets"

gh_secret() {
  local name="$1" value="$2"
  printf '%s' "$value" | gh secret set "$name" --repo "$(gh repo view --json nameWithOwner -q .nameWithOwner)" 2>/dev/null \
    && success "GitHub secret set: $name" \
    || warn "Could not set GitHub secret '$name' — set it manually in repo Settings → Secrets → Actions"
}

gh auth status &>/dev/null || { info "Not logged in to GitHub CLI — opening browser…"; gh auth login; }

gh_secret VERCEL_TOKEN       "$VERCEL_TOKEN"
gh_secret VERCEL_ORG_ID      "$VERCEL_ORG_ID"
gh_secret VERCEL_PROJECT_ID  "$VERCEL_PROJECT_ID"

# ── step 5: push env vars to vercel ──────────────────────────────────────────
echo ""
info "Step 5/5 — Pushing environment variables to Vercel"

vercel_env() {
  local key="$1" val="$2" envs="${3:-production preview development}"
  for env in $envs; do
    # Remove existing value silently, then add fresh
    echo "$val" | vercel env rm "$key" "$env" --yes 2>/dev/null || true
    echo "$val" | vercel env add "$key" "$env" 2>/dev/null \
      && success "Vercel env set [$env]: $key" \
      || warn "Could not set Vercel env '$key' for $env"
  done
}

vercel_env DATABASE_URL           "$DATABASE_URL"
vercel_env GITHUB_CLIENT_ID       "$GITHUB_CLIENT_ID"
vercel_env GITHUB_CLIENT_SECRET   "$GITHUB_CLIENT_SECRET"
vercel_env OPENAI_API_KEY         "$OPENAI_API_KEY"
vercel_env ANTHROPIC_API_KEY      "$ANTHROPIC_API_KEY"

# NEXT_PUBLIC_APP_URL: production only (preview URLs are auto-set by Vercel)
echo "$NEXT_PUBLIC_APP_URL" | vercel env rm NEXT_PUBLIC_APP_URL production --yes 2>/dev/null || true
echo "$NEXT_PUBLIC_APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production 2>/dev/null \
  && success "Vercel env set [production]: NEXT_PUBLIC_APP_URL" \
  || warn "Could not set NEXT_PUBLIC_APP_URL"

# ── done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              All done!                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  GitHub secrets set:  VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
echo "  Vercel env vars set: DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,"
echo "                       NEXT_PUBLIC_APP_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY"
echo ""
echo "  Next steps:"
echo "   1. Update your GitHub OAuth App callback URL to:"
echo "      ${NEXT_PUBLIC_APP_URL}/api/auth/github/callback"
echo "   2. Run database migration:"
echo "      psql \$DATABASE_URL -f scripts/01-create-schema.sql"
echo "   3. Push to main to trigger your first deploy:"
echo "      git push origin main"
echo ""
