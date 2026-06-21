#!/usr/bin/env bash
# One-shot helper for free-tier deployment secrets.
# Run after Neon / Render / R2 are created.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

need() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing env: $1" >&2
    exit 1
  fi
}

run_migrations() {
  need DATABASE_URL
  echo "→ Running DB migrations..."
  pnpm --filter @vibeking/db exec node scripts/migrate-sql.mjs
  DATABASE_URL="$DATABASE_URL" pnpm --filter @vibeking/db db:seed
  echo "✓ Database ready"
}

print_render_env() {
  cat <<EOF

── Render env vars (Dashboard → vibeking-api → Environment) ──
DATABASE_URL=$DATABASE_URL
WEB_ORIGIN=$WEB_ORIGIN
API_BASE_URL=$API_BASE_URL
SITE_BASE_DOMAIN=$SITE_BASE_DOMAIN
GITHUB_CALLBACK_URL=$GITHUB_CALLBACK_URL
S3_ENDPOINT=$S3_ENDPOINT
S3_BUCKET=${S3_BUCKET:-vibeking}
S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
S3_REGION=auto
S3_FORCE_PATH_STYLE=false
GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET

EOF
}

print_vercel_env() {
  cat <<EOF

── Vercel env vars (Project → Settings → Environment Variables) ──
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WEB_ORIGIN=$NEXT_PUBLIC_WEB_ORIGIN
NEXT_PUBLIC_PREVIEW_ORIGIN=$NEXT_PUBLIC_PREVIEW_ORIGIN

EOF
}

print_agent_env() {
  cat <<EOF

── Agent Skill credentials (~/.vibeking/credentials) ──
export VIBEKING_API_BASE=$NEXT_PUBLIC_API_URL
# api_key=vk_...  (create at \$WEB_ORIGIN/dashboard)

EOF
}

case "${1:-help}" in
  migrate)
    run_migrations
    ;;
  print-env)
    need DATABASE_URL
    need WEB_ORIGIN
    need API_BASE_URL
    need SITE_BASE_DOMAIN
    need GITHUB_CALLBACK_URL
    need S3_ENDPOINT
    need S3_ACCESS_KEY_ID
    need S3_SECRET_ACCESS_KEY
    need GITHUB_CLIENT_ID
    need GITHUB_CLIENT_SECRET
    NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-${API_BASE_URL%/}/api/v1}"
    NEXT_PUBLIC_WEB_ORIGIN="${NEXT_PUBLIC_WEB_ORIGIN:-$WEB_ORIGIN}"
    NEXT_PUBLIC_PREVIEW_ORIGIN="${NEXT_PUBLIC_PREVIEW_ORIGIN:-$API_BASE_URL}"
    print_render_env
    print_vercel_env
    print_agent_env
    ;;
  *)
    echo "Usage:"
    echo "  DATABASE_URL=... $0 migrate"
    echo "  (set all vars)   $0 print-env"
    ;;
esac