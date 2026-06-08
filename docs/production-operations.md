# Production Operations

## Goal

Keep production recoverable, observable, and easy to sanity-check after deploys.

## Files

- `infra/scripts/backup-postgres.sh`
- `infra/scripts/restore-postgres.sh`
- `infra/scripts/check-production-health.sh`
- `infra/scripts/cleanup-old-backups.sh`
- `infra/scripts/run-nightly-backup.sh`

## Backup

Create a compressed PostgreSQL dump from the running production container:

```bash
cd ~/prognozist
bash infra/scripts/backup-postgres.sh
```

To store the dump in a custom path:

```bash
bash infra/scripts/backup-postgres.sh /var/backups/prognozist/postgres-manual.sql.gz
```

Recommended minimum:

- daily dump
- keep at least 7 daily copies
- copy backups off the VPS as well
- keep a checksum next to each dump

## Automated Nightly Backup

Run the wrapper script manually:

```bash
cd ~/prognozist
bash infra/scripts/run-nightly-backup.sh
```

What it does:

- creates a timestamped PostgreSQL dump
- writes a `.sha256` checksum file
- updates `postgres-latest.sql.gz` symlink
- removes old backups based on retention days
- can optionally run the HTTP health check after backup

Useful environment variables:

- `BACKUP_DIR` default: `~/prognozist/backups`
- `RETENTION_DAYS` default: `7`
- `RUN_HEALTHCHECK_AFTER_BACKUP=1` to run the smoke check after backup

Example:

```bash
BACKUP_DIR=/var/backups/prognozist RETENTION_DAYS=14 RUN_HEALTHCHECK_AFTER_BACKUP=1 \
bash infra/scripts/run-nightly-backup.sh
```

## Retention Cleanup

Run retention cleanup manually:

```bash
cd ~/prognozist
RETENTION_DAYS=14 BACKUP_DIR=/var/backups/prognozist bash infra/scripts/cleanup-old-backups.sh
```

## Cron Setup

Example cron job for nightly backups at 03:30 server time:

```cron
30 3 * * * cd /home/deploy/prognozist && BACKUP_DIR=/var/backups/prognozist RETENTION_DAYS=14 bash infra/scripts/run-nightly-backup.sh >> /var/log/prognozist-backup.log 2>&1
```

To edit cron:

```bash
crontab -e
```

Recommended:

- store dumps outside the repo directory if possible
- write cron output to a log file
- periodically verify that fresh backup files are actually appearing
- test restore on a non-production copy at least once

## Restore

Restore from a compressed dump:

```bash
cd ~/prognozist
bash infra/scripts/restore-postgres.sh /var/backups/prognozist/postgres-manual.sql.gz
```

Before a real restore:

- stop writes if possible
- take a fresh safety backup
- restore first on a non-production copy when time allows
- verify the dump checksum before restore when available:

```bash
sha256sum -c /var/backups/prognozist/postgres-manual.sql.gz.sha256
```

## Health Check

Run the basic production smoke check:

```bash
cd ~/prognozist
bash infra/scripts/check-production-health.sh
```

This checks:

- frontend responds over HTTPS
- backend `/api/v1/health` returns `{"status":"ok"}`

## After Deploy

Suggested deploy flow:

```bash
git checkout main
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend alembic upgrade head
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build backend bot frontend
bash infra/scripts/check-production-health.sh
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

## Log Checks

Useful commands:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 backend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 bot
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 frontend
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 caddy
```

## Monitoring Minimum

For the current stage of the project, the minimum practical monitoring set is:

- HTTP smoke check on `/api/v1/health`
- manual review of bot/backend/frontend logs after deploy
- regular PostgreSQL backups
- admin review of donation events in the logs page

## Follow-up Ideas

- off-server backup upload
- uptime monitor with alerting
- disk-space and memory alerts
- structured log shipping
