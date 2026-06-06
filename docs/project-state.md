# Project State

Last updated: 2026-06-06.

Repository: `barsev174-star/prognozist`.

Current local path on this PC:

```text
C:\Users\zapra\OneDrive\Документы\Prognozist 1.0
```

## Purpose

Telegram bot and Telegram Mini App for football match predictions.

Players should be able to:

- open the Mini App from Telegram;
- view current and future matches;
- make predictions before a match starts;
- answer two public yes/no questions;
- see the VIP question text, but answer it only with active VIP access;
- see points earned for a completed match;
- view rankings, leagues, referrals, profile, and VIP status.

Admin should be able to:

- create seasons, tournaments, matches, and match questions;
- set two public questions and one VIP question per match;
- enter match results and correct answers;
- manage users, test VIP access, and review logs;
- trigger scoring and VIP group result publication.

## Current Working State

As of 2026-06-06, the local Docker stack works and the Telegram Mini App works through ngrok.

Known-good tunnel URL during the latest session:

```text
https://secret-asleep-filing.ngrok-free.dev
```

Important: ngrok URLs are temporary unless a reserved domain is configured. If ngrok is restarted and gives a new URL, update `.env` and recreate `backend` and `bot`.

The previous Cloudflare quick tunnel scheme was unstable on this network. It failed with Cloudflare edge TLS/QUIC/HTTP2 errors. Localtunnel also worked intermittently, but ngrok is the current working scheme.

## Important Local Env Values

Keep this shape in `.env` for local/ngrok testing:

```env
ENVIRONMENT=local
TELEGRAM_WEBAPP_URL=https://your-ngrok-url.ngrok-free.dev
NEXT_PUBLIC_API_BASE_URL=/api/v1
BACKEND_CORS_ORIGINS=http://localhost:3000,https://your-ngrok-url.ngrok-free.dev
BACKEND_URL=http://backend:8000
TELEGRAM_ADMIN_IDS=1321200291
```

Do not print or commit `BOT_TOKEN`.

Frontend proxies `/api/v1/*` to backend through `frontend/next.config.ts`, so only frontend port `3000` needs a public ngrok URL.

## Start Locally

1. Start Docker Desktop.

2. Open PowerShell in the project directory:

```powershell
cd "C:\Users\zapra\OneDrive\Документы\Prognozist 1.0"
```

3. Start the app stack:

```powershell
docker compose up -d
docker compose exec backend alembic upgrade head
```

4. In a second PowerShell window, start ngrok and keep that window open:

```powershell
ngrok http 3000
```

5. Copy the HTTPS ngrok URL into `.env`:

```env
TELEGRAM_WEBAPP_URL=https://your-ngrok-url.ngrok-free.dev
BACKEND_CORS_ORIGINS=http://localhost:3000,https://your-ngrok-url.ngrok-free.dev
```

6. Recreate services that read those env values:

```powershell
docker compose up -d --force-recreate backend bot
```

7. In Telegram, send `/start` to the bot again and use the fresh "Open app" button. Old bot buttons can still point to an old tunnel URL.

## Useful Checks

```powershell
docker compose ps
docker compose logs -f bot
docker compose logs -f frontend
docker compose logs -f backend
```

Local checks:

```powershell
curl http://localhost:8000/health
curl http://localhost:3000/api/v1/health
```

Ngrok checks:

```powershell
curl https://your-ngrok-url.ngrok-free.dev/api/v1/health
```

Ngrok local inspector:

```text
http://127.0.0.1:4040
http://127.0.0.1:4040/api/tunnels
```

Local URLs:

- `http://localhost:3000/dev-login`
- `http://localhost:3000/`
- `http://localhost:3000/admin`
- `http://localhost:8000/health`

## Stop Locally

```powershell
docker compose down
```

Stop ngrok with `Ctrl+C` in the ngrok terminal window.

## Local Test Login

Use:

```text
http://localhost:3000/dev-login
```

Expected local test flow:

- Generate a random player to test normal app behavior.
- Enter as a player to test predictions, questions, rankings, leagues, profile, and VIP screens.
- Use Telegram ID `1321200291` for admin access.
- Admin pages include navigation back to the app/testing flow.

If dev login fails with "backend is not running / ENVIRONMENT=local / Telegram ID in TELEGRAM_ADMIN_IDS", first check migrations:

```powershell
docker compose exec backend alembic upgrade head
```

The earlier observed cause was an empty database with missing `users` table.

## Implemented Recently

- Two public questions plus one VIP question per match.
- Admin can see and save all three question fields on the questions page.
- Match completion shows question texts next to correct-answer selectors.
- VIP question is visible to all players, but answer is locked unless VIP.
- Local dev login supports normal player testing and admin testing separately.
- Random local players get random names instead of all being `Dev Admin`.
- Admin match creation has a prepared World Cup 2026 team list with flag icons saved into existing team logo fields.
- Normal players get a clear no-admin-access screen if they open admin pages.
- Admin users page can list players, block/unblock users, edit VIP expiration, and grant test VIP access.
- Admin logs page shows system events and point-award records.
- Completed/started matches are closed for new predictions.
- Completed match card can show points breakdown.
- League owner prize editing was added.
- Frontend `/api/v1` rewrite supports one-public-URL setup.
- Admin navigation has one Users entry in the sections row; the duplicate dark quick button was removed.
- Home screen now shows the player's VIP status directly.
- The duplicate VIP navigation tile was removed from the home sections grid; VIP is entered through the status card.
- `/vip` is no longer a placeholder. It shows current VIP state, benefits, and how to activate VIP through the bot.
- Bot now softly deletes the player's `/start` command message; important bot replies and payment/result confirmations are kept.
- Player match list now shows whether the player has already submitted a score prediction, public-question answers, and VIP answer for each match.
- Admin match list now shows question readiness before selecting a match: two public questions and VIP question.
- `/admin/expert` now has a usable admin flow: select match, create/update expert score prediction, set public/VIP question answers, see publication status, and publish to the VIP channel.
- Expert predictions now support answers for both public questions plus the VIP question.

## Current Assessment

Local MVP readiness: about 84%.

Real public launch readiness: about 60%.

The core prediction flow works locally and the Telegram Mini App works through ngrok. The remaining work is mostly production hosting, payments/VIP polish, broader bot-message policy, and broader manual testing with several player scenarios.

## Remaining Product TODOs

- Replace flag icons with official federation crests if real licensed team logos are needed.
- Expand Telegram bot message cleanup policy beyond `/start` only if testing proves it is not confusing.
- Add stable production hosting/public URL instead of temporary ngrok.
- Continue manual testing with several random players: predictions, question answers, VIP/non-VIP behavior, match completion, points, rankings, leagues.
- Continue production readiness work: stable hosting, secrets, backups, monitoring, real domain, and deploy instructions.
- Prepare final release/support instructions.

## Notes For Another Chat

Before changing anything, run:

```powershell
git status --short --branch
docker compose ps
```

This Codex environment may not be able to write to the main `.git` directory. A service clone may exist at `.codex-push-check/` for GitHub syncing/pushing.

Do not revert user changes. If services are already running, keep the existing Docker/ngrok scheme unless the user asks to change it.
