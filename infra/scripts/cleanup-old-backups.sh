#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
BACKUP_PATTERN="${BACKUP_PATTERN:-postgres-*.sql.gz}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "Backup directory does not exist, nothing to clean: $BACKUP_DIR"
  exit 0
fi

echo "Removing backups older than $RETENTION_DAYS days from $BACKUP_DIR"
find "$BACKUP_DIR" -type f -name "$BACKUP_PATTERN" -mtime +"$RETENTION_DAYS" -print -delete
find "$BACKUP_DIR" -type f -name "${BACKUP_PATTERN}.sha256" -mtime +"$RETENTION_DAYS" -print -delete

echo "Backup cleanup completed"
