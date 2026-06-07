#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
BACKUP_FILE="$BACKUP_DIR/postgres-$TIMESTAMP.sql.gz"
LATEST_LINK="$BACKUP_DIR/postgres-latest.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
RUN_HEALTHCHECK_AFTER_BACKUP="${RUN_HEALTHCHECK_AFTER_BACKUP:-0}"

mkdir -p "$BACKUP_DIR"

echo "Starting nightly backup job"
bash "$ROOT_DIR/infra/scripts/backup-postgres.sh" "$BACKUP_FILE"

sha256sum "$BACKUP_FILE" > "$BACKUP_FILE.sha256"
ln -sfn "$(basename "$BACKUP_FILE")" "$LATEST_LINK"
ln -sfn "$(basename "$BACKUP_FILE").sha256" "$LATEST_LINK.sha256"

echo "Checksum created: $BACKUP_FILE.sha256"

RETENTION_DAYS="$RETENTION_DAYS" BACKUP_DIR="$BACKUP_DIR" bash "$ROOT_DIR/infra/scripts/cleanup-old-backups.sh"

if [[ "$RUN_HEALTHCHECK_AFTER_BACKUP" == "1" ]]; then
  bash "$ROOT_DIR/infra/scripts/check-production-health.sh"
fi

echo "Nightly backup job completed"
