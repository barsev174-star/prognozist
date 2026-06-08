# Project State

Last updated: 2026-06-08.

Repository: `barsev174-star/prognozist`.

Primary local workspace on this PC:

```text
C:\Users\zapra\OneDrive\Документы\Prognozist 1.0
```

## Product

Prognozist is a Telegram bot plus Telegram Mini App for football predictions.

Core player flow:

- open the Mini App from Telegram;
- browse upcoming and completed matches;
- submit a score prediction before kickoff;
- answer public yes/no questions;
- see the VIP question, and answer it only with active VIP access;
- review points and ranking progress;
- use leagues, profile, referrals, and VIP screens.

Core admin flow:

- create seasons, tournaments, matches, and questions;
- manage two public questions plus one VIP question per match;
- enter final scores and correct answers;
- manage users and VIP access;
- review logs;
- manage expert predictions and VIP publication flow.

## Current Production State

Production is live on:

```text
https://prognozistapp.ru
```

Known-good production facts:

- frontend responds with `HTTP/2 200`;
- backend health works at `https://prognozistapp.ru/api/v1/health`;
- Caddy HTTPS works;
- Telegram bot polling works;
- Telegram Mini App opens from the bot;
- admin login works at `https://prognozistapp.ru/admin/login`;
- Alembic migrations are applied through `0006`.

Important production env/settings:

- `APP_DOMAIN=prognozistapp.ru`
- `TELEGRAM_WEBAPP_URL=https://prognozistapp.ru`
- `BACKEND_CORS_ORIGINS=https://prognozistapp.ru`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=prognozistapp_bot`
- `TELEGRAM_ADMIN_IDS=1321200291`
- BotFather `/setdomain` is set to `prognozistapp.ru`

Important production networking note:

- In `docker-compose.prod.yml`, the bot needs:

```yaml
extra_hosts:
  - "api.telegram.org:149.154.167.220"
```

This is required because the VPS/container path preferred IPv6 and Telegram API calls timed out.

## Git And Handoff Workflow

This project has two local Git realities:

1. Main working folder:

```text
C:\Users\zapra\OneDrive\Документы\Prognozist 1.0
```

2. Service clone used for reliable commits/pushes:

```text
C:\Users\zapra\OneDrive\Документы\Prognozist 1.0\.codex-push-check
```

Why this matters:

- the main workspace `.git` may fail to create `index.lock`;
- because of that, normal `git add` / `git commit` in the root folder is not always reliable;
- the safe default for commits is the service clone.

Recommended Git workflow for future sessions:

1. Do all code edits in the main workspace.
2. Before commit, run:

```powershell
git status --short --branch
docker compose ps
```

3. Try normal Git in the main workspace once.
4. If you get `index.lock permission denied`, switch immediately to the service clone.
5. Copy changed files from the main workspace into `.codex-push-check`.
6. Commit and push from `.codex-push-check`.
7. Prefer a dedicated branch for each batch: `codex/...`
8. Merge through GitHub PR into `main`.
9. On VPS, always deploy from `main` unless there is a specific reason to test a branch first.

Known recent service-clone history before this design batch:

- `846d51f Add production deployment setup`
- `f7c4d9f Clean up match page text and handoff notes`
- `c03b810 Add Telegram Stars donations and clean VIP/admin text`
- `e306c42 Fix duplicate admin match formatter`

## Implemented Recently

### Payments And Donations

- Telegram Stars VIP flow exists and works in production testing.
- Donation flow through Telegram Stars was added.
- Donation backend pieces exist:
  - payment confirmation endpoint
  - donation model/schema/service
  - migration `0006`
- Bot supports:
  - donation button
  - fixed Stars amounts
  - custom amount flow
  - thank-you message after donation payment

### Admin And Backend

- admin logs page supports donation-related events;
- backend tests were added for donation and VIP payment scenarios;
- backup/restore/health/retention scripts were added for production operations;
- production operations docs were added.
- tournament prediction questions can now be:
  - created in admin;
  - filled with answer options;
  - resolved with one-shot scoring and `PointsLog` writes;
  - shown with a short scoring summary after resolution.

### Frontend And UX

- player-facing match section was cleaned from mojibake;
- VIP page, rankings, and home structure were improved;
- release polish pass started for key player-facing screens:
  - home
  - matches list
  - match prediction screen
  - rankings
  - VIP
  - profile
  - referrals
  - leagues shell
- global visual layer was strengthened:
  - more expressive surfaces
  - better hero blocks
  - stronger information hierarchy
  - more intentional "sports app" atmosphere
- tournament flow was extended:
  - public tournaments screen exists;
  - players can answer long-term tournament questions;
  - resolved tournament questions now show personal awarded points;
- VIP page now restores access to the saved private-channel invite link from inside the Mini App when a link exists.

### Important Frontend Bug Found During Polish

During the release polish pass, some strings were switched to Unicode escapes to avoid file-encoding corruption.

Important caveat:

- Unicode escapes are safe inside JavaScript string constants and JSX expressions;
- they are not safe when passed as raw JSX string attributes like:

```tsx
<AppHeader title="\u041c..." />
```

That renders literal `\u041c...` text in the browser.

This was identified on 2026-06-08 from a screenshot and must be treated as a specific JSX rendering bug, not a general Russian-text bug.

## Current Assessment

Estimated readiness:

- MVP: about `86%`
- public launch readiness: about `78-82%`

Why it is not higher yet:

- payment flow still needs final donation end-to-end validation;
- there is still remaining mojibake in some non-player/admin/bot areas;
- monitoring is still lightweight;
- broader real-user manual testing is still needed.

## Highest-Priority Open Work

### 1. Release Visual Polish Completion

Continue the current polish pass and verify it in the Mini App on real devices.

Focus:

- confirm no literal `\u...` text remains;
- keep the new visual direction consistent across player-facing screens;
- avoid redesigning flows while polishing.

### 2. Leagues UX

Current player flow:

- league creation already uses tournament selection by name;
- league join works by invite code shown on the league card.

Next improvement:

- add one-tap share for the invite code from the Mini App;
- optionally build a Telegram deep-link/share helper around the invite code.

### 3. Teams / World Cup 2026 Data

Need to move toward a proper team reference model instead of relying on string-only team fields and static frontend lists.

Desired next step:

- add/seed a `teams` source of truth for World Cup 2026 participants;
- prepare safe logo assets strategy;
- connect admin match creation to structured team data.

### 4. Payments Finalization

VIP is in good shape.

Still needed:

- donation end-to-end test in production;
- confirm logging/idempotency behavior after real donation;
- decide whether donation analytics should remain logs-only or get a fuller admin view later.
- finish real VIP-channel smoke test with a configured production channel and bot admin rights.

### 5. Operations

Current baseline exists:

- backup script
- restore script
- nightly backup wrapper
- retention cleanup
- production smoke check

Still needed:

- cron setup on VPS if not already finalized;
- off-server backup copy;
- external uptime monitoring / alerting.

## VPS Deploy Pattern

After a branch is merged into `main`, the safe production deploy flow is:

```bash
cd ~/prognozist
git checkout main
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend alembic upgrade head
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build backend bot frontend
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Then run:

```bash
bash infra/scripts/check-production-health.sh
```

## Notes For Another Chat

If another Codex chat starts without this context, it should be told all of the following:

- project: Telegram bot + Telegram Mini App for football predictions;
- repo: `barsev174-star/prognozist`;
- local path: `C:\Users\zapra\OneDrive\Документы\Prognozist 1.0`;
- production domain: `https://prognozistapp.ru`;
- backend health: `https://prognozistapp.ru/api/v1/health`;
- bot polling, Mini App, HTTPS, and admin login are working;
- migrations are applied through `0006`;
- donations via Telegram Stars were added;
- operational scripts/docs were added;
- release design polish is in progress;
- main workspace Git may fail on `index.lock permission denied`;
- commits/pushes should usually be done through `.codex-push-check`;
- before any work, run:

```powershell
git status --short --branch
docker compose ps
```

- do not touch secrets or commit `.env`;
- do not revert unrelated local changes;
- if committing, prefer a fresh `codex/...` branch in `.codex-push-check`.
