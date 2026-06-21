#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

WISH_ID="${1:?usage: update-status.sh <wish-id> <status> [api-key]}"
STATUS="${2:?status required}"
API_KEY="$(resolve_api_key "${3:-}")"

api_patch "/wishes/${WISH_ID}/status" "{\"status\":\"${STATUS}\"}" | jq .