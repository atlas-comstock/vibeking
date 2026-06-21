#!/usr/bin/env bash
# Print values for Render Blueprint form (copy-paste).
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(npx neonctl@latest connection-string main --project-id mute-lake-76401992 -o json 2>/dev/null | tr -d '"')"
fi

if [[ -z "$DATABASE_URL" ]]; then
  echo "Set DATABASE_URL or run: npx neonctl connection-string main --project-id mute-lake-76401992 -o json" >&2
  exit 1
fi

cat <<EOF
Paste into Render Blueprint → Environment:

DATABASE_URL
${DATABASE_URL}

WEB_ORIGIN
https://vibeking.vercel.app

API_BASE_URL
https://vibeking-api.onrender.com

SITE_BASE_DOMAIN
vibeking-api.onrender.com

GITHUB_CALLBACK_URL
https://vibeking-api.onrender.com/api/v1/auth/github/callback

S3_ENDPOINT
(Cloudflare R2 — create bucket first, or leave blank for now)

S3_ACCESS_KEY_ID
(R2 token)

S3_SECRET_ACCESS_KEY
(R2 token)

GITHUB_CLIENT_ID
(GitHub OAuth App → create at github.com/settings/developers)

GITHUB_CLIENT_SECRET
(GitHub OAuth App secret)

SESSION_SECRET → leave empty (Render auto-generates)
EOF