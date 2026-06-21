#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

SITE_URL="${1:?usage: register-site.sh <site-url> <title> [description] [api-key]}"
TITLE="${2:?title required}"
DESCRIPTION="${3:-}"
API_KEY="$(resolve_api_key "${4:-}")"

TAGS_JSON="[]"
if [[ -n "${TAGS:-}" ]]; then
  TAGS_JSON=$(printf '%s' "$TAGS" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";"")) | map(select(length>0))')
fi

BODY=$(jq -n \
  --arg siteUrl "$SITE_URL" \
  --arg title "$TITLE" \
  --arg description "$DESCRIPTION" \
  --argjson tags "$TAGS_JSON" \
  '{
    siteUrl: $siteUrl,
    title: $title,
    description: (if $description == "" then null else $description end),
    tags: $tags,
    source: "here_now"
  }')

api_post "/here-now/site-posts" "$BODY" | jq .