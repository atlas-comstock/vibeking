#!/usr/bin/env bash
# Deploy vibeking-api to Render via CLI (after `render login` or RENDER_API_KEY set).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v render >/dev/null; then
  echo "Install: brew install render" >&2
  exit 1
fi

if [[ -z "${RENDER_API_KEY:-}" ]] && ! render whoami -o text --confirm 2>/dev/null | rg -q .; then
  echo "Run: render login" >&2
  exit 1
fi

need() { [[ -n "${!1:-}" ]] || { echo "Missing: $1" >&2; exit 1; }; }

need DATABASE_URL
WEB_ORIGIN="${WEB_ORIGIN:-https://vibeking.vercel.app}"
API_BASE_URL="${API_BASE_URL:-https://vibeking-api.onrender.com}"
SITE_BASE_DOMAIN="${SITE_BASE_DOMAIN:-vibeking-api.onrender.com}"
GITHUB_CALLBACK_URL="${GITHUB_CALLBACK_URL:-${API_BASE_URL}/api/v1/auth/github/callback}"
S3_BUCKET="${S3_BUCKET:-vibeking}"
S3_REGION="${S3_REGION:-auto}"
S3_FORCE_PATH_STYLE="${S3_FORCE_PATH_STYLE:-false}"

# S3 + GitHub optional for first boot (health check); fill for login/publish.
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-}"
S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-}"
GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-}"
GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-}"

echo "→ Creating service vibeking-api (or use Blueprint if this fails)..."

ARGS=(
  --name vibeking-api
  --repo "https://github.com/atlas-comstock/vibeking"
  --branch master
  --region singapore
  --plan free
  --health-check-path /health
  --env-var "DATABASE_URL=${DATABASE_URL}"
  --env-var "WEB_ORIGIN=${WEB_ORIGIN}"
  --env-var "API_BASE_URL=${API_BASE_URL}"
  --env-var "SITE_BASE_DOMAIN=${SITE_BASE_DOMAIN}"
  --env-var "GITHUB_CALLBACK_URL=${GITHUB_CALLBACK_URL}"
  --env-var "S3_BUCKET=${S3_BUCKET}"
  --env-var "S3_REGION=${S3_REGION}"
  --env-var "S3_FORCE_PATH_STYLE=${S3_FORCE_PATH_STYLE}"
  --env-var "WISH_PLATFORM_ENABLED=true"
  --env-var "CLAIMS_ENABLED=true"
  --env-var "INVITE_ONLY=false"
  --confirm -o json
)

[[ -n "$S3_ENDPOINT" ]] && ARGS+=(--env-var "S3_ENDPOINT=${S3_ENDPOINT}")
[[ -n "$S3_ACCESS_KEY_ID" ]] && ARGS+=(--env-var "S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}")
[[ -n "$S3_SECRET_ACCESS_KEY" ]] && ARGS+=(--env-var "S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}")
[[ -n "$GITHUB_CLIENT_ID" ]] && ARGS+=(--env-var "GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}")
[[ -n "$GITHUB_CLIENT_SECRET" ]] && ARGS+=(--env-var "GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}")

render services create "${ARGS[@]}"