# Project State

Last updated: 2026-06-05.

Repository: `barsev174-star/prognozist`.
Local path on this PC: `C:\Users\barsv\Desktop\Боты\Прогнозист`.

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

## Current Local Launch Scheme

Cloudflare quick tunnels were unstable on this network. The working local test scheme is one ngrok tunnel to frontend port `3000`.

Important `.env` values for local/ngrok testing:

```env
TELEGRAM_WEBAPP_URL=https://your-ngrok-url.ngrok-free.dev
NEXT_PUBLIC_API_BASE_URL=/api/v1
BACKEND_CORS_ORIGINS=http://localhost:3000,https://your-ngrok-url.ngrok-free.dev
BACKEND_URL=http://backend:8000
TELEGRAM_ADMIN_IDS=1321200291
```

Frontend proxies `/api/v1/*` to backend through `frontend/next.config.ts`, so only the frontend needs a public ngrok URL.

## Start Locally

```powershell
cd "C:\Users\barsv\Desktop\Боты\Прогнозист"
docker compose up -d
docker compose exec backend alembic upgrade head
ngrok http 3000
```

After copying the ngrok HTTPS URL into `.env`, recreate app services:

```powershell
docker compose up -d --force-recreate backend frontend bot
```

Useful checks:

```powershell
docker compose ps
docker compose logs -f bot
docker compose logs -f frontend
docker compose logs -f backend
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

Use `http://localhost:3000/dev-login`.

- Click `Случайный игрок` to generate a test player ID and name.
- Click `Войти как игрок` to enter the normal Mini App UI.
- Use Telegram ID `1321200291` and click `Войти в админку` for admin access.
- Admin pages include `Приложение` and `Выйти` buttons to switch back to app/testing login.

## Implemented Recently

- Two public questions plus one VIP question per match.
- Admin can see and save all three question fields on the questions page.
- Match completion shows question texts next to correct-answer selectors.
- VIP question is visible to all players, but answer is locked unless VIP.
- Local dev login supports normal player testing and admin testing separately.
- Random local players get random names instead of all being `Dev Admin`.
- Admin match creation has a prepared World Cup 2026 team list with flag icons saved into existing team logo fields.
- Normal players get a clear no-access screen if they open admin pages.
- Admin users page can list players, block/unblock users, edit VIP expiration, and grant test VIP access.
- Admin logs page shows system events and point-award records.
- Completed/started matches are closed for new predictions.
- Completed match card can show points breakdown.
- League owner prize editing was added.
- Frontend `/api/v1` rewrite supports single-ngrok setup.
- Admin navigation has a single `Пользователи` entry in the sections row; the duplicate dark quick button was removed.

## Current Assessment

Local MVP readiness: about 75%.
Real public launch readiness: about 55-60%.

The core prediction flow works locally. The remaining work is mostly production readiness, payment/VIP polish, real hosting, and more manual testing.

## Remaining Product TODOs

- Replace flag icons with official federation crests if real licensed team logos are needed.
- Show the player's VIP status directly in the app/home screen, not only inside the VIP/profile areas.
- Decide and implement Telegram bot message cleanup policy.
- Add stable production hosting/public URL instead of temporary ngrok.
- Continue manual testing with several random players: predictions, question answers, VIP/non-VIP behavior, match completion, points, rankings, leagues.
- Improve expert/admin expert flow. `/admin/expert` is still weak compared with the rest of admin.
- Prepare final release/support instructions.

## Notes For Another Chat

Before changing anything, run:

```powershell
git status --short --branch
docker compose ps
```

Do not revert user changes. If services are already running, keep the existing Docker/ngrok scheme unless the user asks to change it.
