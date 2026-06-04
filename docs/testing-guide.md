# Testing Guide

Эта инструкция будет пополняться по мере готовности проекта.

## Когда можно начинать тестировать

Первое полезное тестирование можно начинать после того, как готовы:

- Docker Compose;
- backend healthcheck;
- PostgreSQL;
- Alembic migrations.

На текущем этапе уже подготовлена структура для такого теста.

## Первый технический тест

1. Создать `.env` из `.env.example`.
2. Запустить сервисы:

```bash
docker compose up --build
```

3. Проверить backend в браузере:

```text
http://localhost:8000/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

4. Применить миграции базы:

```bash
docker compose exec backend alembic upgrade head
```

Если команда завершилась без ошибки, база создала таблицы проекта.

5. Открыть документацию API:

```text
http://localhost:8000/docs
```

Там уже должны быть видны разделы:

- Auth;
- Users;
- Admin;
- Matches;
- Predictions;
- Questions;
- Rankings;
- Leagues;
- Referrals;
- Achievements;
- VIP.

В разделе Admin также должны быть endpoint'ы для турнира:

- `GET /api/v1/admin/tournaments/{tournament_id}/completion-readiness`;
- `POST /api/v1/admin/tournaments/{tournament_id}/complete`.

Они отвечают за ручное завершение турнира после того, как все матчи завершены.

## Первый ручной тест продукта

Этот сценарий уже можно проходить после запуска Docker, миграций и локального входа.

### Подготовка

1. Создать `.env` из `.env.example`.
2. Проверить в `.env`:

```text
ENVIRONMENT=local
TELEGRAM_ADMIN_IDS=12345
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

3. Запустить сервисы:

```bash
docker compose up --build
```

4. Применить миграции:

```bash
docker compose exec backend alembic upgrade head
```

### Создание тестовых данных

1. Открыть:

```text
http://localhost:3000/dev-login
```

2. Войти с Telegram ID:

```text
12345
```

3. Создать сезон:

```text
http://localhost:3000/admin/seasons
```

4. Создать турнир:

```text
http://localhost:3000/admin/tournaments
```

5. Создать матч:

```text
http://localhost:3000/admin/matches
```

Важно: время начала матча должно быть в будущем, иначе прогнозы будут закрыты.

6. Создать общий и VIP-вопрос:

```text
http://localhost:3000/admin/questions
```

### Первый прогноз

1. Открыть:

```text
http://localhost:3000/matches
```

2. Выбрать матч.
3. Ввести счет.
4. Ответить на общий вопрос.
5. Нажать сохранить.

Ожидаемый результат:

```text
Прогноз сохранен.
```

VIP-вопрос в локальном тесте будет закрыт, пока пользователю не выдан VIP.

### Проверка начисления очков

1. После сохранения прогноза открыть:

```text
http://localhost:3000/admin/matches
```

2. В блоке `Завершить матч` выбрать нужный матч.
3. Ввести итоговый счет.
4. Выбрать правильные ответы на вопросы.
5. Нажать `Завершить и начислить`.

Если итоговый счет совпадает с прогнозом, пользователь должен получить `10` очков за точный счет.

6. Открыть:

```text
http://localhost:3000/rankings
```

Ожидаемый результат: пользователь `Dev Admin` появляется в рейтинге с начисленными очками.

## Проверка авторизации

Backend уже содержит endpoint:

```text
POST http://localhost:8000/api/v1/auth/telegram
```

Но этот endpoint нельзя корректно проверить обычным текстом из браузера: он принимает специальные данные `initData`, подписанные Telegram. Полноценная проверка авторизации начнется после настройки:

- настоящего Telegram bot token;
- Mini App URL в BotFather;
- открытия приложения внутри Telegram.

Если открыть frontend просто в браузере на `localhost`, приложение должно показать сообщение:

```text
Откройте приложение внутри Telegram.
```

Это нормальное поведение для текущего этапа.

## Когда появится ручное тестирование продукта

Первое ручное тестирование админки уже можно будет делать после запуска Docker и миграций.

Для локального входа:

1. Убедиться, что в `.env` указано:

```text
ENVIRONMENT=local
TELEGRAM_ADMIN_IDS=12345
```

2. Открыть:

```text
http://localhost:3000/dev-login
```

3. Оставить Telegram ID `12345` и нажать вход.
4. Перейти по порядку:

```text
/admin/seasons
/admin/tournaments
/admin/matches
/admin/questions
```

5. Создать:

- сезон;
- турнир;
- матч;
- общий вопрос;
- VIP-вопрос.

После этого backend уже будет иметь данные для первого пользовательского сценария.

Ручное тестирование полного пользовательского сценария в Mini App начнется после реализации:

- Telegram Mini App auth;
- экрана матчей;
- сохранения прогноза.

Тогда можно будет пройти первый пользовательский сценарий: открыть приложение, увидеть матч и сделать прогноз.

## Проверка тестов backend

После установки backend-зависимостей тесты можно запускать так:

```bash
docker compose exec backend pytest
```

Сейчас уже добавлены тесты для правил начисления очков:

- точный счет дает 10 очков;
- правильный исход дает 3 очка;
- точный счет не получает дополнительные 3 очка за исход;
- правильный ответ Да/Нет дает настроенное количество очков;
- неправильный ответ дает 0 очков.

Если `pytest` не найден локально на компьютере, это нормально: запускать тесты проще внутри Docker-контейнера backend.

## Проверка VIP

В Swagger должны появиться endpoint'ы:

- `GET /api/v1/vip/status`;
- `POST /api/v1/vip/invoice`;
- `POST /api/v1/vip/payment/confirm`.

Реальную оплату через Telegram Stars можно проверить только после настройки:

- настоящего `BOT_TOKEN`;
- платежей Stars для бота;
- `TELEGRAM_VIP_CHANNEL_ID`, если нужно сразу выдавать ссылку в закрытый канал;
- прав администратора для бота в закрытом канале.

В локальном режиме можно проверить только наличие endpoint'ов и запуск сервисов.

## Проверка автопостинга

В Admin API должны появиться endpoint'ы:

- `POST /api/v1/admin/expert-predictions`;
- `GET /api/v1/admin/expert-predictions/{match_id}`;
- `PATCH /api/v1/admin/expert-predictions/{expert_prediction_id}`;
- `POST /api/v1/admin/expert-predictions/{expert_prediction_id}/publish`.

Bot-сервис также поднимает внутренний endpoint:

```text
POST http://bot:8080/internal/publish/vip
```

Он используется backend'ом для публикаций в VIP-канал. Для реальной проверки нужен настроенный `TELEGRAM_VIP_CHANNEL_ID` и права администратора у бота в канале.
