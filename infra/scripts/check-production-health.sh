#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="${APP_DOMAIN:-prognozistapp.ru}"
BASE_URL="${BASE_URL:-https://$APP_DOMAIN}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${PROD_ENV_FILE:-$ROOT_DIR/.env.production}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  APP_DOMAIN="${APP_DOMAIN:-prognozistapp.ru}"
  BASE_URL="${BASE_URL:-https://$APP_DOMAIN}"
fi

echo "Checking frontend: $BASE_URL"
curl --fail --silent --show-error --location --head "$BASE_URL" >/dev/null

echo "Checking backend health: $BASE_URL/api/v1/health"
HEALTH_RESPONSE="$(curl --fail --silent --show-error "$BASE_URL/api/v1/health")"
echo "$HEALTH_RESPONSE"

if [[ "$HEALTH_RESPONSE" != '{"status":"ok"}' ]]; then
  echo "Unexpected health response"
  exit 1
fi

echo "Production health checks passed"
