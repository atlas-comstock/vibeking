#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

DIST_DIR="${1:?usage: publish-herenow.sh <dist-dir> [title] [api-key]}"
TITLE="${2:-}"
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

VIEWER_JSON="null"
if [[ -n "$TITLE" ]]; then
  VIEWER_JSON=$(jq -n --arg title "$TITLE" '{title: $title}')
fi

INIT=$(api_post "/here-now/publish" "{\"files\":${FILES_JSON},\"viewer\":${VIEWER_JSON}}")
echo "$INIT" | jq .

VERSION=$(echo "$INIT" | jq -r '.upload.versionId')
FINALIZE=$(echo "$INIT" | jq -r '.upload.finalizeUrl')

echo "$INIT" | jq -c '.upload.uploads[]' | while read -r row; do
  url=$(echo "$row" | jq -r '.url')
  path=$(echo "$row" | jq -r '.path')
  curl -fsS -X PUT -T "${DIST_DIR}/${path}" "$url" >/dev/null
  echo "uploaded ${path}"
done

curl -fsS -X POST -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" -H "X-VibeKing-Client: cursor/skill" \
  -d "{\"versionId\":\"${VERSION}\"}" \
  "$FINALIZE" | jq .