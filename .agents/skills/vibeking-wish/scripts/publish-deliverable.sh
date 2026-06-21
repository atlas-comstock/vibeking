#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

WISH_ID="${1:?usage: publish-deliverable.sh <wish-id> <dist-dir> [api-key]}"
DIST_DIR="${2:?dist directory required}"
API_KEY="$(resolve_api_key "${3:-}")"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "error: dist directory not found: $DIST_DIR" >&2
  exit 1
fi

FILES_JSON="["
first=1
while IFS= read -r -d '' file; do
  rel="${file#${DIST_DIR}/}"
  size=$(wc -c <"$file" | tr -d ' ')
  ctype="application/octet-stream"
  [[ "$rel" == *.html ]] && ctype="text/html"
  [[ "$rel" == *.css ]] && ctype="text/css"
  [[ "$rel" == *.js ]] && ctype="application/javascript"
  [[ $first -eq 0 ]] && FILES_JSON+=","
  first=0
  FILES_JSON+="{\"path\":\"${rel}\",\"size\":${size},\"contentType\":\"${ctype}\"}"
done < <(find "$DIST_DIR" -type f -print0)
FILES_JSON+="]"

INIT=$(api_post "/deliverables/publish" "{\"wishId\":\"${WISH_ID}\",\"kind\":\"hosted\",\"files\":${FILES_JSON}}")
echo "$INIT" | jq .

SLUG=$(echo "$INIT" | jq -r '.slug')
VERSION=$(echo "$INIT" | jq -r '.upload.versionId')
FINALIZE=$(echo "$INIT" | jq -r '.upload.finalizeUrl')

echo "$INIT" | jq -c '.upload.uploads[]' | while read -r row; do
  url=$(echo "$row" | jq -r '.url')
  path=$(echo "$row" | jq -r '.path')
  curl -fsS -X PUT -T "${DIST_DIR}/${path}" "$url" >/dev/null
  echo "uploaded ${path}"
done

curl -fsS -X POST -H "Authorization: Bearer ${API_KEY}" \
  -H "X-VibeKing-Client: cursor/skill" \
  "${API_BASE}/deliverables/${SLUG}/finalize" \
  -d "{\"versionId\":\"${VERSION}\"}" | jq .