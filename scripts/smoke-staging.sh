#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-https://api.staging.vibeking.dev}"
WEB_URL="${WEB_URL:-https://staging.vibeking.dev}"

echo "==> Health check: $API_URL/health"
curl -fsS "$API_URL/health" | grep -q '"ok":true'

echo "==> API v1: $API_URL/api/v1"
curl -fsS "$API_URL/api/v1" | grep -q 'VibeKing'

echo "==> Web homepage: $WEB_URL"
curl -fsS "$WEB_URL" | grep -q 'VibeKing'

echo "==> Metrics: $API_URL/metrics"
curl -fsS "$API_URL/metrics" | grep -q 'vibeking_up'

echo "All staging smoke checks passed."