# Telegram Sports Predictions MVP

MVP-платформа для турниров спортивных прогнозов внутри Telegram: bot, Mini App, admin panel и backend API.

## Services

- `backend` - FastAPI API, бизнес-логика, PostgreSQL, миграции.
- `bot` - Telegram Bot на aiogram 3, меню, платежи, VIP-канал, автопостинг.
- `frontend` - Next.js Mini App и Admin Panel.
- `postgres` - основная база данных.

## Local Development

1. Скопировать `.env.example` в `.env`.
2. Заполнить Telegram-настройки и секреты.
3. Запустить сервисы:

```bash
docker compose up --build
```

Подробные шаги проверки описаны в `docs/testing-guide.md`.

## Project Structure

```text
backend/
  app/
    api/
    core/
    db/
    models/
    schemas/
    services/
    jobs/
    tests/
bot/
  handlers/
  keyboards/
  middlewares/
  services/
frontend/
  app/
  components/
  lib/
  styles/
docs/
infra/
```

## MVP Scope

- Telegram onboarding.
- Match predictions.
- Public and VIP questions.
- Scoring and rankings.
- Tournament-bound leagues.
- Telegram Stars VIP.
- Private VIP channel with comments via discussion group.
- Expert predictions.
- Event-based autoposting.
- Admin panel.
