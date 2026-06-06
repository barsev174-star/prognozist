# Production Hosting

## Goal

Run the stack behind one stable public domain with HTTPS:

- `frontend` serves the Telegram Mini App and admin pages;
- `caddy` terminates TLS and proxies `/api/v1/*` to `backend`;
- `bot` talks to Telegram and internal services;
- `postgres` stores application data.

## Files Added

- `docker-compose.prod.yml`
- `.env.production.example`
- `infra/Caddyfile`
- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `bot/Dockerfile.prod`

## First Production Setup

1. Copy `.env.production.example` to `.env.production`.
2. Set a real domain in `APP_DOMAIN`.
3. Point the DNS `A` record of that domain to the server IP.
4. Fill secrets: `JWT_SECRET`, `BOT_TOKEN`, `BOT_INTERNAL_TOKEN`, `POSTGRES_PASSWORD`.
5. Set `TELEGRAM_WEBAPP_URL=https://your-domain`.
6. Set `BACKEND_CORS_ORIGINS=https://your-domain`.
7. Set `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` to your bot username without `@`.
8. Start the stack:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

9. Run migrations:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend alembic upgrade head
```

For dry-run validation before real secrets are filled in, you can temporarily point Compose at the example file:

```powershell
$env:PROD_ENV_FILE=".env.production.example"
docker compose -f docker-compose.prod.yml --env-file .env.production.example config
```

## Telegram Switch

After the domain is live, update the bot's Mini App URL in BotFather to the same HTTPS domain.

For browser admin login, the same bot username is used by the Telegram login widget on `/admin/login`.

## Notes

- The production compose file does not mount source code and does not use dev servers.
- `NEXT_PUBLIC_API_BASE_URL=/api/v1` keeps frontend and backend under one public domain.
- Caddy obtains HTTPS certificates automatically after DNS is pointed correctly.
- Keep ports `80` and `443` open on the server firewall.
