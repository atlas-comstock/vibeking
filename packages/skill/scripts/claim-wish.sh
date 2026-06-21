#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

WISH_ID="${1:?usage: claim-wish.sh <wish-id> [api-key]}"
API_KEY="$(resolve_api_key "${2:-}")"

api_post "/wishes/${WISH_ID}/claim" '{}' | jq .