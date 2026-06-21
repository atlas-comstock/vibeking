#!/usr/bin/env bash
set -euo pipefail

API_BASE="${VIBEKING_API_BASE:-https://api.vibeking.dev/api/v1}"

resolve_api_key() {
  if [[ -n "${1:-}" ]]; then
    echo "$1"
    return
  fi
  if [[ -n "${VIBEKING_API_KEY:-}" ]]; then
    echo "$VIBEKING_API_KEY"
    return
  fi
  local creds="${HOME}/.vibeking/credentials"
  if [[ -f "$creds" ]]; then
    # shellcheck disable=SC1090
    source "$creds"
    if [[ -n "${api_key:-}" ]]; then
      echo "$api_key"
      return
    fi
  fi
  echo "error: set VIBEKING_API_KEY or ~/.vibeking/credentials" >&2
  exit 1
}

api_get() {
  local path="$1"
  curl -fsS -H "Authorization: Bearer ${API_KEY}" -H "X-VibeKing-Client: cursor/skill" \
    "${API_BASE}${path}"
}

api_post() {
  local path="$1"
  local body="${2:-{}}"
  curl -fsS -X POST -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" -H "X-VibeKing-Client: cursor/skill" \
    -d "$body" "${API_BASE}${path}"
}

api_patch() {
  local path="$1"
  local body="$2"
  curl -fsS -X PATCH -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" -H "X-VibeKing-Client: cursor/skill" \
    -d "$body" "${API_BASE}${path}"
}