#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

API_KEY="$(resolve_api_key "${1:-}")"
STATUS="${2:-open}"
TAG="${3:-}"

QS="?status=${STATUS}&limit=20"
if [[ -n "$TAG" ]]; then
  QS="${QS}&tag=${TAG}"
fi

api_get "/wishes${QS}" | jq '.items[] | {id, title, status, tags, budgetCents}'