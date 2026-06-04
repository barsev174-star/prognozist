# Backlog GitHub Issues: Telegram Platform For Sports Predictions MVP

Ниже backlog в формате, близком к GitHub Issues. Каждая задача должна быть реализуема и тестируема отдельно. Задачи сгруппированы по milestones.

## Labels

- `area:backend`
- `area:bot`
- `area:frontend`
- `area:admin`
- `area:db`
- `area:infra`
- `area:tests`
- `area:docs`
- `feature:auth`
- `feature:matches`
- `feature:predictions`
- `feature:scoring`
- `feature:rankings`
- `feature:leagues`
- `feature:vip`
- `feature:referrals`
- `feature:achievements`
- `feature:autoposting`
- `priority:p0`
- `priority:p1`
- `priority:p2`

---

# Milestone 1: Project Foundation

## Issue 1. Initialize monorepo structure

**Labels:** `area:infra`, `priority:p0`

### Description

Create the base project structure for backend, bot, frontend, docs, and infrastructure.

### Tasks

- Create `backend/` directory.
- Create `bot/` directory.
- Create `frontend/` directory.
- Create `infra/` or root Docker files.
- Create `docs/` directory.
- Add root README with local setup instructions.

### Acceptance Criteria

- Repository has clear top-level structure.
- README explains the purpose of each service.
- No application logic is required in this issue.

---

## Issue 2. Add Docker Compose for local development

**Labels:** `area:infra`, `priority:p0`

### Description

Add local Docker Compose environment for PostgreSQL, backend, bot, and frontend.

### Tasks

- Add `docker-compose.yml`.
- Add PostgreSQL service.
- Add backend service placeholder.
- Add bot service placeholder.
- Add frontend service placeholder.
- Add `.env.example`.

### Acceptance Criteria

- `docker compose up` starts PostgreSQL.
- Environment variables are documented.
- Services can be started independently.

---

## Issue 3. Create backend FastAPI skeleton

**Labels:** `area:backend`, `priority:p0`

### Description

Create the minimal FastAPI application structure.

### Tasks

- Add FastAPI app entrypoint.
- Add `/health` endpoint.
- Add config loading.
- Add versioned API router `/api/v1`.
- Add backend dependency files.

### Acceptance Criteria

- Backend starts locally.
- `/health` returns success response.
- API routes are mounted under `/api/v1`.

---

## Issue 4. Configure SQLAlchemy database connection

**Labels:** `area:backend`, `area:db`, `priority:p0`

### Description

Add database session management for PostgreSQL.

### Tasks

- Configure SQLAlchemy engine.
- Add session dependency.
- Add declarative base.
- Add database URL config.
- Add connection smoke test.

### Acceptance Criteria

- Backend can connect to PostgreSQL.
- Failed DB connection produces clear error.
- Session dependency is reusable by API routes.

---

## Issue 5. Configure Alembic migrations

**Labels:** `area:db`, `priority:p0`

### Description

Set up Alembic for database schema migrations.

### Tasks

- Initialize Alembic.
- Configure metadata autogeneration.
- Add migration naming convention.
- Document migration commands.

### Acceptance Criteria

- Alembic can create and apply migrations.
- Migration environment reads the same DB settings as backend.

---

## Issue 6. Create frontend Next.js skeleton

**Labels:** `area:frontend`, `priority:p0`

### Description

Create the base Next.js app with Tailwind.

### Tasks

- Initialize Next.js app.
- Configure Tailwind.
- Add base layout.
- Add placeholder routes for app sections.
- Add API client skeleton.

### Acceptance Criteria

- Frontend starts locally.
- Tailwind styles are applied.
- Routes for matches, rankings, leagues, profile, VIP, referrals, and admin exist.

---

## Issue 7. Create aiogram bot skeleton

**Labels:** `area:bot`, `priority:p0`

### Description

Create minimal Telegram bot service using aiogram 3.

### Tasks

- Add bot entrypoint.
- Add config loading.
- Add startup/shutdown lifecycle.
- Add base router.
- Add logging setup.

### Acceptance Criteria

- Bot service starts with configured token.
- Bot can register handlers.
- Bot logs startup errors clearly.

---

# Milestone 2: Database Schema

## Issue 8. Add users table and model

**Labels:** `area:db`, `area:backend`, `priority:p0`

### Description

Create user persistence model.

### Tasks

- Add `users` SQLAlchemy model.
- Add Alembic migration.
- Add unique index for `telegram_id`.
- Add indexes for `username` and `premium_until`.

### Acceptance Criteria

- Users table exists after migration.
- `telegram_id` uniqueness is enforced.
- Model supports blocked users and VIP expiry.

---

## Issue 9. Add seasons and tournaments tables

**Labels:** `area:db`, `area:backend`, `priority:p0`

### Description

Create season and tournament models.

### Tasks

- Add `seasons` model.
- Add `tournaments` model.
- Add status enums.
- Add foreign key from tournament to season.
- Add date constraints.

### Acceptance Criteria

- Season can contain many tournaments.
- Tournament cannot exist without season.
- Status values are constrained.

---

## Issue 10. Add matches table

**Labels:** `area:db`, `area:backend`, `feature:matches`, `priority:p0`

### Description

Create match model linked to tournament.

### Tasks

- Add `matches` model.
- Add team names and logo fields.
- Add start time.
- Add status enum.
- Add nullable final score fields.
- Add tournament index.

### Acceptance Criteria

- Match belongs to tournament.
- Scores cannot be negative.
- Match statuses are constrained.

---

## Issue 11. Add predictions table

**Labels:** `area:db`, `area:backend`, `feature:predictions`, `priority:p0`

### Description

Create score prediction model.

### Tasks

- Add `predictions` model.
- Link prediction to user and match.
- Add predicted scores.
- Add awarded points fields.
- Add exact score and outcome flags.
- Add unique constraint on user and match.

### Acceptance Criteria

- User can have only one score prediction per match.
- Predicted scores cannot be negative.
- Prediction is deleted if user or match is deleted.

---

## Issue 12. Add public and VIP question tables

**Labels:** `area:db`, `area:backend`, `feature:predictions`, `priority:p0`

### Description

Create question models for match-level yes/no questions.

### Tasks

- Add `questions` model.
- Add `vip_questions` model.
- Link both to matches.
- Add correct answer fields.
- Add points fields.
- Enforce one public question per match.
- Enforce one VIP question per match.

### Acceptance Criteria

- Match can have one public question.
- Match can have one VIP question.
- Correct answer can remain empty before match result.

---

## Issue 13. Add question answer tables

**Labels:** `area:db`, `area:backend`, `feature:predictions`, `priority:p0`

### Description

Store user answers for public and VIP questions.

### Tasks

- Add `question_answers` model.
- Add `vip_question_answers` model.
- Add unique constraints for one answer per user per question.
- Add correctness and points fields.

### Acceptance Criteria

- User cannot submit duplicate answer for same question.
- Answers are cascade-deleted with user or question.

---

## Issue 14. Add leagues and league members tables

**Labels:** `area:db`, `area:backend`, `feature:leagues`, `priority:p0`

### Description

Create league models with required tournament binding.

### Tasks

- Add `leagues` model.
- Link league to owner user.
- Link league to tournament.
- Add name, description, prize description.
- Add unique invite code.
- Add status enum: `active`, `completed`, `archived`.
- Add `league_members` join table.

### Acceptance Criteria

- League cannot exist without tournament.
- League owner can be identified.
- User can join multiple leagues.
- League can have many users.

---

## Issue 15. Add historical result tables

**Labels:** `area:db`, `area:backend`, `feature:rankings`, `feature:leagues`, `priority:p0`

### Description

Add snapshot tables for completed tournaments and leagues.

### Tasks

- Add `tournament_results` model.
- Add `league_results` model.
- Add final rank and final points.
- Add uniqueness constraints.

### Acceptance Criteria

- Each user has one tournament result per tournament.
- Each user has one league result per league.
- Historical rankings remain available after completion.

---

## Issue 16. Add expert predictions table

**Labels:** `area:db`, `area:backend`, `feature:autoposting`, `priority:p1`

### Description

Formalize expert predictions separately from matches.

### Tasks

- Add `expert_predictions` model.
- Link expert prediction to match.
- Add optional expert user reference.
- Add score prediction.
- Add public and VIP question answers.
- Add publish status fields.
- Enforce one expert prediction per match for MVP.

### Acceptance Criteria

- Expert prediction is not stored in match row.
- Expert prediction can be published once.
- Model can later support multiple experts.

---

## Issue 17. Add VIP subscriptions table

**Labels:** `area:db`, `area:backend`, `feature:vip`, `priority:p1`

### Description

Store Telegram Stars VIP purchases and subscription periods.

### Tasks

- Add `vip_subscriptions` model.
- Link subscription to user.
- Store Telegram payment charge id.
- Store Stars amount and duration.
- Store invite link.
- Add status enum.

### Acceptance Criteria

- Duplicate Telegram payment charge id is impossible.
- Active and expired subscriptions are distinguishable.

---

## Issue 18. Add referrals tables

**Labels:** `area:db`, `area:backend`, `feature:referrals`, `priority:p1`

### Description

Store referral relationships and activation state.

### Tasks

- Add `referrals` model.
- Link referrer and referred users.
- Add status enum.
- Add activation timestamp.
- Prevent self-referral.
- Ensure referred user has only one referrer.

### Acceptance Criteria

- Referral can be registered before activation.
- Referral can be activated after first prediction.
- Self-referral is rejected.

---

## Issue 19. Add achievements tables and seed data

**Labels:** `area:db`, `area:backend`, `feature:achievements`, `priority:p1`

### Description

Add achievement catalog and user achievement assignments.

### Tasks

- Add `achievements` model.
- Add `user_achievements` model.
- Seed MVP achievements.
- Add share template field.

### Acceptance Criteria

- MVP achievements are present after migration or seed.
- User can earn an achievement only once.

---

## Issue 20. Add system logs and points ledger

**Labels:** `area:db`, `area:backend`, `priority:p0`

### Description

Add logging tables for system events and points accrual.

### Tasks

- Add `system_logs` model.
- Add `points_log` model.
- Add JSONB payload field.
- Add indexes.
- Add uniqueness guard for points source.

### Acceptance Criteria

- Important events can be logged with payload.
- Points cannot be accidentally awarded twice for same source.

---

# Milestone 3: Auth And Users

## Issue 21. Implement Telegram Mini App auth validation

**Labels:** `area:backend`, `feature:auth`, `priority:p0`

### Description

Validate Telegram Mini App init data on the backend.

### Tasks

- Parse init data.
- Verify Telegram hash.
- Reject expired or invalid init data.
- Extract Telegram user profile.

### Acceptance Criteria

- Valid init data authenticates.
- Invalid hash is rejected.
- Frontend cannot spoof user id.

---

## Issue 22. Implement auth endpoint

**Labels:** `area:backend`, `feature:auth`, `priority:p0`

### Description

Create `/auth/telegram` endpoint.

### Tasks

- Accept Telegram init data.
- Create user if missing.
- Update username and first name if changed.
- Return access token and current profile.
- Register referral if payload contains referrer.

### Acceptance Criteria

- New user is created.
- Existing user is reused.
- Blocked user cannot authenticate.

---

## Issue 23. Add backend current-user dependency

**Labels:** `area:backend`, `feature:auth`, `priority:p0`

### Description

Provide reusable dependency for authenticated API routes.

### Tasks

- Add access token generation.
- Add token verification.
- Add current user dependency.
- Add blocked-user guard.

### Acceptance Criteria

- Protected endpoints require valid token.
- Blocked users are denied.

---

## Issue 24. Implement user profile endpoint

**Labels:** `area:backend`, `feature:auth`, `priority:p1`

### Description

Add endpoint for current user profile.

### Tasks

- Implement `GET /users/me`.
- Return points, VIP status, profile fields.
- Return referral count summary.

### Acceptance Criteria

- Authenticated user can load profile.
- Response contains enough data for profile page.

---

## Issue 25. Implement frontend Telegram auth bootstrap

**Labels:** `area:frontend`, `feature:auth`, `priority:p0`

### Description

Authenticate Mini App user on frontend startup.

### Tasks

- Read Telegram init data from SDK.
- Send init data to backend.
- Store API token in memory or safe client storage.
- Add loading and error states.
- Redirect user into app after auth.

### Acceptance Criteria

- Mini App authenticates automatically inside Telegram.
- Auth error is visible to user.
- API client attaches token to requests.

---

## Issue 26. Implement bot start and main menu

**Labels:** `area:bot`, `feature:auth`, `priority:p0`

### Description

Create Telegram bot onboarding without public commands except start entry.

### Tasks

- Handle `/start`.
- Parse deep link payload.
- Create or update user through backend.
- Show main menu buttons.
- Add Mini App launch button.
- Add buttons: ranking, leagues, VIP, referrals, rules, support.

### Acceptance Criteria

- User can open bot and see menu.
- Referral payload is passed to backend.
- Mini App button opens configured web app.

---

# Milestone 4: Admin Core

## Issue 27. Implement admin authorization model

**Labels:** `area:backend`, `area:admin`, `priority:p0`

### Description

Restrict admin endpoints to configured admin Telegram users.

### Tasks

- Add admin settings.
- Add admin permission dependency.
- Return forbidden for non-admins.
- Add tests for admin access.

### Acceptance Criteria

- Admin routes are protected.
- Non-admin user cannot access admin endpoints.

---

## Issue 28. Implement seasons admin API

**Labels:** `area:backend`, `area:admin`, `priority:p1`

### Description

Add CRUD operations for seasons.

### Tasks

- Create season.
- List seasons.
- Update season.
- Complete season.
- Validate status transitions.

### Acceptance Criteria

- Admin can manage seasons through API.
- Invalid status transitions are rejected.

---

## Issue 29. Implement tournaments admin API

**Labels:** `area:backend`, `area:admin`, `priority:p0`

### Description

Add CRUD operations for tournaments, excluding final completion workflow.

### Tasks

- Create tournament.
- List tournaments.
- Update tournament.
- Validate season ownership.
- Validate date ranges.

### Acceptance Criteria

- Admin can manage tournaments.
- Tournament must belong to season.

---

## Issue 30. Implement matches admin API

**Labels:** `area:backend`, `area:admin`, `feature:matches`, `priority:p0`

### Description

Add CRUD operations for matches.

### Tasks

- Create match.
- List matches.
- Update match.
- Delete match.
- Change status.
- Validate tournament ownership.

### Acceptance Criteria

- Admin can manage matches.
- Match can only belong to existing tournament.

---

## Issue 31. Implement questions admin API

**Labels:** `area:backend`, `area:admin`, `feature:predictions`, `priority:p0`

### Description

Add admin endpoints for public and VIP questions.

### Tasks

- Create public question.
- Create VIP question.
- Update question text.
- Assign correct answer.
- Validate one question per type per match.

### Acceptance Criteria

- Admin can define questions before match.
- Admin can set correct answers during match result entry.

---

## Issue 32. Build admin layout and navigation

**Labels:** `area:frontend`, `area:admin`, `priority:p1`

### Description

Create Admin Panel shell inside frontend.

### Tasks

- Add admin route group.
- Add admin navigation.
- Add access denied state.
- Add basic admin API client.

### Acceptance Criteria

- Admin can navigate between sections.
- Non-admin receives clear denial.

---

## Issue 33. Build seasons and tournaments admin screens

**Labels:** `area:frontend`, `area:admin`, `priority:p1`

### Description

Create UI for season and tournament management.

### Tasks

- Seasons list.
- Season form.
- Tournaments list.
- Tournament form.
- Status display.

### Acceptance Criteria

- Admin can create and edit seasons.
- Admin can create and edit tournaments.

---

## Issue 34. Build matches and questions admin screens

**Labels:** `area:frontend`, `area:admin`, `priority:p0`

### Description

Create UI for match and question management.

### Tasks

- Match list by tournament.
- Match creation form.
- Match edit form.
- Public question form.
- VIP question form.
- Correct answer controls.

### Acceptance Criteria

- Admin can create match with questions.
- Admin can edit questions and correct answers.

---

# Milestone 5: Matches And Predictions

## Issue 35. Implement public matches API

**Labels:** `area:backend`, `feature:matches`, `priority:p0`

### Description

Expose match list and match detail to users.

### Tasks

- Implement `GET /matches`.
- Implement `GET /matches/{match_id}`.
- Include public question.
- Include VIP question only if user has active VIP or as locked preview.
- Include current user's existing prediction and answers.

### Acceptance Criteria

- User can list matches.
- User can open match details.
- VIP question access respects subscription status.

---

## Issue 36. Implement score prediction endpoint

**Labels:** `area:backend`, `feature:predictions`, `priority:p0`

### Description

Allow users to create or update match score prediction before match start.

### Tasks

- Implement prediction create/update endpoint.
- Validate match exists.
- Validate match has not started.
- Validate scores are non-negative.
- Enforce one prediction per user and match.
- Trigger first prediction side effects.

### Acceptance Criteria

- User can save score prediction before start time.
- User cannot save prediction after start time.
- Re-saving updates existing prediction.

---

## Issue 37. Implement public question answer endpoint

**Labels:** `area:backend`, `feature:predictions`, `priority:p0`

### Description

Allow user to answer the public yes/no question before match start.

### Tasks

- Implement answer create/update.
- Validate question exists.
- Validate linked match has not started.
- Enforce one answer per user and question.

### Acceptance Criteria

- User can answer yes/no.
- User can update answer before match starts.
- User cannot answer after match starts.

---

## Issue 38. Implement VIP question answer endpoint

**Labels:** `area:backend`, `feature:predictions`, `feature:vip`, `priority:p0`

### Description

Allow VIP users to answer VIP yes/no question before match start.

### Tasks

- Implement VIP answer create/update.
- Validate active VIP.
- Validate question exists.
- Validate linked match has not started.
- Enforce one answer per user and question.

### Acceptance Criteria

- Active VIP user can answer VIP question.
- Free user is denied.
- Expired VIP user is denied.

---

## Issue 39. Build matches list screen

**Labels:** `area:frontend`, `feature:matches`, `priority:p0`

### Description

Create Mini App matches list.

### Tasks

- Display upcoming and completed matches.
- Show teams, logos, start time, status.
- Add tournament filter if needed.
- Link to match detail.

### Acceptance Criteria

- User can browse matches.
- Match status is understandable.
- Layout works on mobile Telegram viewport.

---

## Issue 40. Build match prediction screen

**Labels:** `area:frontend`, `feature:predictions`, `priority:p0`

### Description

Create match detail screen with all prediction inputs.

### Tasks

- Show team names and logos.
- Add score input controls.
- Add public yes/no control.
- Add VIP yes/no control.
- Add locked VIP state.
- Add save flow.
- Show saved prediction.
- Disable input after match start.

### Acceptance Criteria

- User can submit complete free prediction.
- VIP user can submit all three predictions.
- Inputs do not overflow small screens.

---

# Milestone 6: Scoring And Rankings

## Issue 41. Implement score outcome calculation service

**Labels:** `area:backend`, `feature:scoring`, `priority:p0`

### Description

Create pure scoring logic for exact score and outcome.

### Tasks

- Implement exact score calculation.
- Implement match outcome calculation.
- Award 10 points for exact score.
- Award 3 points for correct outcome.
- Ensure exact score does not also award outcome points.
- Add unit tests.

### Acceptance Criteria

- Exact score gives 10 points.
- Correct outcome gives 3 points.
- Wrong prediction gives 0 points.
- Draw outcomes are handled correctly.

---

## Issue 42. Implement question scoring service

**Labels:** `area:backend`, `feature:scoring`, `priority:p0`

### Description

Calculate points for public and VIP question answers.

### Tasks

- Score public question answers.
- Score VIP question answers.
- Mark answer correctness.
- Respect configured points value.
- Add unit tests.

### Acceptance Criteria

- Correct yes/no answer receives configured points.
- Incorrect answer receives 0 points.
- Missing answer receives 0 points.

---

## Issue 43. Implement match result entry and scoring workflow

**Labels:** `area:backend`, `area:admin`, `feature:scoring`, `priority:p0`

### Description

Allow admin to enter match result and trigger scoring.

### Tasks

- Add result entry endpoint.
- Save final score.
- Save correct question answers.
- Set match status to `calculating`.
- Run scoring in transaction.
- Write points ledger entries.
- Update prediction and answer rows.
- Set match status to `completed`.

### Acceptance Criteria

- Completed match awards points.
- Repeated result submission does not double-award points.
- Match ends in `completed` status.

---

## Issue 44. Build match result admin screen

**Labels:** `area:frontend`, `area:admin`, `feature:scoring`, `priority:p0`

### Description

Create UI for entering final match result and correct answers.

### Tasks

- Add score result form.
- Add correct public answer control.
- Add correct VIP answer control.
- Add confirmation before scoring.
- Show calculation status.

### Acceptance Criteria

- Admin can complete match from UI.
- UI shows errors for missing required result data.

---

## Issue 45. Implement ranking query service

**Labels:** `area:backend`, `feature:rankings`, `priority:p0`

### Description

Create service for global, season, tournament, and league rankings.

### Tasks

- Calculate global season ranking.
- Calculate tournament ranking.
- Calculate league ranking.
- Return TOP-50.
- Return current user's rank.
- Define tie-breaker rules.

### Acceptance Criteria

- Rankings are deterministic.
- User's own position is available even outside TOP-50.
- League ranking uses only league members and tournament points.

---

## Issue 46. Implement rankings API

**Labels:** `area:backend`, `feature:rankings`, `priority:p0`

### Description

Expose rankings to frontend and bot.

### Tasks

- Add global ranking endpoint.
- Add season ranking endpoint.
- Add tournament ranking endpoint.
- Add current user ranking endpoint.
- Add response schemas.

### Acceptance Criteria

- Frontend can load ranking data.
- API responses include rank, points, username, and user id.

---

## Issue 47. Build ranking screen

**Labels:** `area:frontend`, `feature:rankings`, `priority:p0`

### Description

Create Mini App ranking view.

### Tasks

- Show TOP-50.
- Highlight current user.
- Show current user's rank if outside TOP-50.
- Show tournament prizes.
- Add loading and empty states.

### Acceptance Criteria

- User can view rankings.
- Current user's position is clear.
- Prize information is visible.

---

# Milestone 7: Leagues

## Issue 48. Implement create league API

**Labels:** `area:backend`, `feature:leagues`, `priority:p0`

### Description

Allow users to create tournament-bound leagues.

### Tasks

- Add create league endpoint.
- Validate tournament is not completed.
- Generate unique invite code.
- Add owner as league member.
- Store prize description.

### Acceptance Criteria

- User can create league for active or upcoming tournament.
- League is linked to tournament.
- Creator becomes member automatically.

---

## Issue 49. Implement join league API

**Labels:** `area:backend`, `feature:leagues`, `priority:p0`

### Description

Allow users to join league by invite code.

### Tasks

- Add join endpoint.
- Validate invite code.
- Validate league is active.
- Validate tournament is not completed.
- Prevent duplicate membership.

### Acceptance Criteria

- User can join valid active league.
- User cannot join archived league.
- Duplicate join is idempotent or returns clear response.

---

## Issue 50. Implement league details and ranking API

**Labels:** `area:backend`, `feature:leagues`, `priority:p0`

### Description

Expose league details and league ranking.

### Tasks

- Add user's leagues endpoint.
- Add league detail endpoint.
- Add league ranking endpoint.
- Include prize description.
- Include tournament status.

### Acceptance Criteria

- User can see leagues they joined.
- League ranking only includes members.
- Archived league can still be viewed.

---

## Issue 51. Build leagues list screen

**Labels:** `area:frontend`, `feature:leagues`, `priority:p0`

### Description

Create Mini App leagues overview.

### Tasks

- List user's active leagues.
- List archived leagues.
- Show tournament name.
- Show prize description.
- Add create league action.
- Add join by invite action.

### Acceptance Criteria

- User can navigate to league detail.
- Active and archived leagues are visually distinct.

---

## Issue 52. Build create and join league flows

**Labels:** `area:frontend`, `feature:leagues`, `priority:p0`

### Description

Create UI for creating a league and joining by code or link.

### Tasks

- Add create league form.
- Add tournament selector.
- Add prize description field.
- Add invite link display.
- Add join form.
- Handle deep link invite code.

### Acceptance Criteria

- User can create league.
- User can share invite link.
- User can join league from invite code.

---

## Issue 53. Build league ranking screen

**Labels:** `area:frontend`, `feature:leagues`, `feature:rankings`, `priority:p0`

### Description

Create ranking view for a specific league.

### Tasks

- Show league name.
- Show prize description.
- Show member ranking.
- Show current user's position.
- Show archived result state.

### Acceptance Criteria

- League ranking matches backend data.
- Archived league remains readable.

---

# Milestone 8: VIP And Private Channel

## Issue 54. Implement VIP status service

**Labels:** `area:backend`, `feature:vip`, `priority:p0`

### Description

Centralize active VIP checks.

### Tasks

- Add VIP status helper.
- Check `premium_until`.
- Check active subscription records.
- Add tests for active and expired VIP.

### Acceptance Criteria

- VIP status is consistent across API.
- Expired VIP is treated as free user.

---

## Issue 55. Implement Telegram Stars invoice creation

**Labels:** `area:backend`, `area:bot`, `feature:vip`, `priority:p0`

### Description

Create payment invoice flow for Telegram Stars.

### Tasks

- Define VIP packages.
- Add backend endpoint to request invoice payload.
- Add bot handler to send invoice.
- Store pending payment context if needed.

### Acceptance Criteria

- User can start VIP purchase from bot or Mini App.
- Telegram payment screen opens.

---

## Issue 56. Implement successful payment handling

**Labels:** `area:backend`, `area:bot`, `feature:vip`, `priority:p0`

### Description

Process Telegram successful payment updates.

### Tasks

- Handle successful payment update in bot.
- Send payment data to backend.
- Verify duplicate charge id.
- Create subscription.
- Extend `premium_until`.
- Log payment event.

### Acceptance Criteria

- Successful payment activates VIP.
- Duplicate payment update does not duplicate subscription.

---

## Issue 57. Implement VIP channel invite link flow

**Labels:** `area:bot`, `area:backend`, `feature:vip`, `priority:p0`

### Description

After VIP purchase, create invite link for private channel.

### Tasks

- Configure VIP channel id.
- Ensure bot has channel admin rights.
- Create single-use invite link.
- Store invite link in subscription.
- Send invite link to user.

### Acceptance Criteria

- VIP user receives valid invite link.
- Invite link is stored for audit.

---

## Issue 58. Implement VIP expiration job

**Labels:** `area:backend`, `area:bot`, `feature:vip`, `priority:p1`

### Description

Expire VIP subscriptions and remove users from private channel.

### Tasks

- Add scheduled job.
- Find expired active subscriptions.
- Mark subscriptions expired.
- Update effective VIP status.
- Ask bot service to remove user from channel.
- Log success and failure.

### Acceptance Criteria

- Expired user loses VIP access.
- Expired user is removed from channel when possible.
- Failures are logged.

---

## Issue 59. Build VIP screen

**Labels:** `area:frontend`, `feature:vip`, `priority:p0`

### Description

Create Mini App VIP page.

### Tasks

- Show current VIP status.
- Show expiry date.
- Show VIP purchase action.
- Show locked feature explanation.
- Launch bot payment flow.

### Acceptance Criteria

- User can see VIP status.
- Free user can start purchase.
- VIP user sees active subscription.

---

# Milestone 9: Expert And Autoposting

## Issue 60. Implement expert prediction admin API

**Labels:** `area:backend`, `area:admin`, `feature:autoposting`, `priority:p1`

### Description

Allow admin to create and update expert prediction for a match.

### Tasks

- Add create endpoint.
- Add update endpoint.
- Validate match exists.
- Validate predicted score.
- Validate question answers.
- Prevent multiple expert predictions per match in MVP.

### Acceptance Criteria

- Admin can save expert prediction.
- Expert prediction is linked to match.

---

## Issue 61. Build expert prediction admin screen

**Labels:** `area:frontend`, `area:admin`, `feature:autoposting`, `priority:p1`

### Description

Create UI for entering expert predictions.

### Tasks

- Select match.
- Enter expert score.
- Enter expert public answer.
- Enter expert VIP answer.
- Save expert prediction.
- Show publish status.

### Acceptance Criteria

- Admin can manage expert prediction from UI.
- Published state is visible.

---

## Issue 62. Implement Telegram post formatting service

**Labels:** `area:bot`, `area:backend`, `feature:autoposting`, `priority:p1`

### Description

Create reusable post templates for VIP channel publications.

### Tasks

- Format expert prediction post.
- Format match result post.
- Format tournament result post.
- Format league result post.
- Keep templates testable.

### Acceptance Criteria

- Posts include required MVP fields.
- Formatting is consistent.

---

## Issue 63. Implement expert prediction publication

**Labels:** `area:backend`, `area:bot`, `feature:autoposting`, `priority:p1`

### Description

Publish expert prediction to VIP channel.

### Tasks

- Add publish endpoint.
- Fetch match, questions, expert prediction.
- Send post through bot.
- Mark expert prediction as published.
- Log publication event.

### Acceptance Criteria

- Admin can publish expert prediction.
- Repeated publish is blocked or idempotent.
- Post appears in VIP channel.

---

## Issue 64. Implement match result autoposting

**Labels:** `area:backend`, `area:bot`, `feature:autoposting`, `priority:p1`

### Description

Publish match summary after scoring is completed.

### Tasks

- Trigger after match completion.
- Calculate users who guessed exact score.
- Calculate users who guessed outcome.
- Calculate average user prediction.
- Compare audience and expert.
- Publish final post to VIP channel.
- Log result.

### Acceptance Criteria

- Completing match triggers final post.
- Post includes all required summary metrics.
- Publication failure does not rollback scoring.

---

## Issue 65. Implement tournament completion autoposting

**Labels:** `area:backend`, `area:bot`, `feature:autoposting`, `feature:rankings`, `priority:p1`

### Description

Publish TOP-10 tournament result and prize winners after manual tournament completion.

### Tasks

- Prepare TOP-10 from snapshot.
- Identify prize winners.
- Format tournament result post.
- Publish to VIP channel.
- Log publication.

### Acceptance Criteria

- Tournament completion publishes final tournament post.
- Post includes TOP-10 and prizes.

---

## Issue 66. Implement league completion autoposting

**Labels:** `area:backend`, `area:bot`, `feature:autoposting`, `feature:leagues`, `priority:p1`

### Description

Publish final league result to league participants after tournament completion.

### Tasks

- Generate final league result message.
- Include league name.
- Include winner.
- Include points.
- Include prize description.
- Include prize disclaimer.
- Send to participants or configured chat strategy.
- Log delivery results.

### Acceptance Criteria

- Each completed league produces final message.
- Message includes required prize reminder.

---

# Milestone 10: Tournament Completion

## Issue 67. Implement tournament completion readiness check

**Labels:** `area:backend`, `area:admin`, `feature:rankings`, `priority:p0`

### Description

Expose match completion progress for admin UI.

### Tasks

- Count total tournament matches.
- Count completed tournament matches.
- Return whether completion is allowed.
- Include blocking matches if any.

### Acceptance Criteria

- Admin can see `completed / total` count.
- Tournament cannot be completed if matches are incomplete.

---

## Issue 68. Implement tournament completion workflow

**Labels:** `area:backend`, `area:admin`, `feature:rankings`, `feature:leagues`, `priority:p0`

### Description

Manually complete tournament and run final processing.

### Tasks

- Add completion endpoint.
- Validate all matches are completed.
- Set tournament status to completed.
- Create `tournament_results` snapshot.
- Complete all active tournament leagues.
- Create `league_results` snapshots.
- Trigger tournament autopost.
- Trigger league autoposts.
- Trigger tournament achievements.

### Acceptance Criteria

- Tournament completion is transactional where needed.
- Repeated completion does not duplicate snapshots.
- All tournament leagues become completed or archived.

---

## Issue 69. Build tournament completion admin UI

**Labels:** `area:frontend`, `area:admin`, `feature:rankings`, `priority:p0`

### Description

Add manual tournament completion button in Admin Panel.

### Tasks

- Show match completion counter.
- Disable button until all matches complete.
- Add confirmation dialog.
- Call completion endpoint.
- Show final processing result.

### Acceptance Criteria

- Admin can complete tournament only when allowed.
- UI clearly shows why completion is blocked.

---

## Issue 70. Implement historical result API

**Labels:** `area:backend`, `feature:rankings`, `feature:leagues`, `priority:p1`

### Description

Expose historical tournament and league results for user profile.

### Tasks

- Add endpoint for current user's tournament history.
- Add endpoint for current user's league history.
- Return rank, points, name, date.

### Acceptance Criteria

- User can view past tournament results.
- User can view past league results.

---

# Milestone 11: Referrals And Achievements

## Issue 71. Implement referral registration

**Labels:** `area:backend`, `area:bot`, `feature:referrals`, `priority:p1`

### Description

Register referral relationship from bot deep link.

### Tasks

- Parse referrer id or code from `/start`.
- Validate referrer exists.
- Prevent self-referral.
- Prevent reassignment.
- Store referral as `registered`.

### Acceptance Criteria

- Referral is saved when user starts via referral link.
- Existing referral is not overwritten.

---

## Issue 72. Implement referral activation after first prediction

**Labels:** `area:backend`, `feature:referrals`, `feature:predictions`, `priority:p1`

### Description

Activate referral only after referred user's first prediction.

### Tasks

- Detect first prediction.
- Mark referral as `activated`.
- Store activation timestamp.
- Trigger referral reward checks.

### Acceptance Criteria

- Registration alone does not activate referral.
- First prediction activates referral once.

---

## Issue 73. Implement referral rewards

**Labels:** `area:backend`, `feature:referrals`, `feature:scoring`, `priority:p1`

### Description

Award points for 5, 10, and 25 activated referrals.

### Tasks

- Count activated referrals.
- Award +20 points at 5 friends.
- Award +50 points at 10 friends.
- Award +100 points at 25 friends.
- Use points ledger uniqueness.
- Add tests.

### Acceptance Criteria

- Rewards are awarded once.
- Points are reflected in rankings.

---

## Issue 74. Implement achievement award service

**Labels:** `area:backend`, `feature:achievements`, `priority:p1`

### Description

Create reusable service for awarding achievements.

### Tasks

- Award achievement by code.
- Prevent duplicate awards.
- Log achievement events.
- Add tests.

### Acceptance Criteria

- Achievement can be granted once per user.
- Service is reusable by scoring and completion workflows.

---

## Issue 75. Implement MVP achievement triggers

**Labels:** `area:backend`, `feature:achievements`, `priority:p1`

### Description

Trigger all MVP achievements from relevant events.

### Tasks

- First prediction.
- First exact score.
- 10 exact scores.
- 100 points.
- Top-10 tournament.
- Tournament champion.
- 50 invited friends.

### Acceptance Criteria

- Each MVP achievement is awarded under correct condition.
- Tests cover each trigger.

---

## Issue 76. Implement achievements API

**Labels:** `area:backend`, `feature:achievements`, `priority:p1`

### Description

Expose user achievements and share card generation.

### Tasks

- Add current user's achievements endpoint.
- Add share card generation endpoint.
- Store generated card URL or file reference.

### Acceptance Criteria

- User can list earned and locked achievements.
- User can generate share card for earned achievement.

---

## Issue 77. Build referrals screen

**Labels:** `area:frontend`, `feature:referrals`, `priority:p1`

### Description

Create referral page in Mini App.

### Tasks

- Show referral link.
- Show activated friends count.
- Show reward thresholds.
- Add share action.

### Acceptance Criteria

- User can copy or share referral link.
- User sees referral progress.

---

## Issue 78. Build achievements UI

**Labels:** `area:frontend`, `feature:achievements`, `priority:p1`

### Description

Show achievements in profile and support sharing.

### Tasks

- Show earned achievements.
- Show locked achievements.
- Add share button.
- Open Telegram share flow.

### Acceptance Criteria

- User can view achievements.
- Earned achievement can be shared.

---

# Milestone 12: Profile And Bot Menu Features

## Issue 79. Build profile screen

**Labels:** `area:frontend`, `priority:p1`

### Description

Create user profile page.

### Tasks

- Show username and first name.
- Show total points.
- Show VIP status.
- Show prediction stats.
- Show referral count.
- Show achievements preview.
- Show historical results.

### Acceptance Criteria

- User can understand their progress.
- Profile handles empty state for new users.

---

## Issue 80. Implement bot ranking button

**Labels:** `area:bot`, `feature:rankings`, `priority:p2`

### Description

Handle main menu ranking button.

### Tasks

- Fetch ranking summary from backend.
- Show top positions.
- Include Mini App button for full ranking.

### Acceptance Criteria

- User can tap ranking in bot.
- Bot returns useful ranking summary.

---

## Issue 81. Implement bot leagues button

**Labels:** `area:bot`, `feature:leagues`, `priority:p2`

### Description

Handle main menu leagues button.

### Tasks

- Fetch user's leagues summary.
- Show active league count.
- Include Mini App button for leagues.

### Acceptance Criteria

- User can tap leagues in bot.
- Bot directs user to Mini App leagues section.

---

## Issue 82. Implement bot VIP button

**Labels:** `area:bot`, `feature:vip`, `priority:p1`

### Description

Handle main menu VIP button.

### Tasks

- Fetch VIP status.
- Show active status or purchase option.
- Start payment flow for free users.

### Acceptance Criteria

- User can check VIP from bot.
- Free user can begin purchase.

---

## Issue 83. Implement bot referrals button

**Labels:** `area:bot`, `feature:referrals`, `priority:p2`

### Description

Handle referrals menu button.

### Tasks

- Generate referral link.
- Fetch referral stats.
- Show reward thresholds.

### Acceptance Criteria

- User can retrieve referral link in bot.

---

## Issue 84. Implement rules and support bot buttons

**Labels:** `area:bot`, `priority:p2`

### Description

Add static bot responses for rules and support.

### Tasks

- Add rules text.
- Add support contact text.
- Add return to menu button.

### Acceptance Criteria

- User can read rules.
- User can find support contact.

---

# Milestone 13: Logs And Observability

## Issue 85. Implement system log service

**Labels:** `area:backend`, `priority:p1`

### Description

Create reusable service for writing system logs.

### Tasks

- Add log creation helper.
- Support event type, user id, payload.
- Avoid logging sensitive payment secrets.
- Add tests.

### Acceptance Criteria

- Services can write structured logs.
- Logs are queryable by event type and date.

---

## Issue 86. Implement admin logs API

**Labels:** `area:backend`, `area:admin`, `priority:p1`

### Description

Expose system logs to admin.

### Tasks

- Add logs endpoint.
- Filter by event type.
- Filter by user.
- Filter by date.
- Add pagination.

### Acceptance Criteria

- Admin can inspect recent events.
- Large log sets are paginated.

---

## Issue 87. Build admin logs screen

**Labels:** `area:frontend`, `area:admin`, `priority:p2`

### Description

Create Admin Panel log viewer.

### Tasks

- Show log table.
- Add filters.
- Add payload details view.
- Add pagination.

### Acceptance Criteria

- Admin can inspect logs from UI.

---

# Milestone 14: Testing

## Issue 88. Add backend test infrastructure

**Labels:** `area:backend`, `area:tests`, `priority:p0`

### Description

Set up backend automated tests.

### Tasks

- Configure pytest.
- Add test database setup.
- Add fixtures for users, tournaments, matches.
- Add API test client.

### Acceptance Criteria

- Backend tests can run locally.
- Tests do not require production services.

---

## Issue 89. Add scoring tests

**Labels:** `area:backend`, `area:tests`, `feature:scoring`, `priority:p0`

### Description

Cover all points calculation rules.

### Tasks

- Test exact score.
- Test correct outcome.
- Test wrong prediction.
- Test draw outcome.
- Test public question.
- Test VIP question.
- Test max free points.
- Test max VIP points.

### Acceptance Criteria

- Scoring rules are fully covered.
- Free max is 13 points.
- VIP max is 16 points.

---

## Issue 90. Add ranking tests

**Labels:** `area:backend`, `area:tests`, `feature:rankings`, `priority:p0`

### Description

Test ranking calculations.

### Tasks

- Test tournament ranking.
- Test season ranking.
- Test league ranking.
- Test tie-breaker.
- Test user outside TOP-50.

### Acceptance Criteria

- Rankings are deterministic and correct.

---

## Issue 91. Add league tests

**Labels:** `area:backend`, `area:tests`, `feature:leagues`, `priority:p0`

### Description

Test league creation, membership, ranking, and archive behavior.

### Tasks

- Test league creation.
- Test owner auto-membership.
- Test join by invite code.
- Test duplicate join.
- Test cannot join archived league.
- Test league result snapshots.

### Acceptance Criteria

- League lifecycle is covered by tests.

---

## Issue 92. Add referral tests

**Labels:** `area:backend`, `area:tests`, `feature:referrals`, `priority:p1`

### Description

Test referral registration, activation, and rewards.

### Tasks

- Test referral registration.
- Test self-referral rejection.
- Test activation after first prediction.
- Test 5 friend reward.
- Test 10 friend reward.
- Test 25 friend reward.
- Test no duplicate rewards.

### Acceptance Criteria

- Referral program behaves according to MVP rules.

---

## Issue 93. Add achievement tests

**Labels:** `area:backend`, `area:tests`, `feature:achievements`, `priority:p1`

### Description

Test MVP achievement triggers.

### Tasks

- Test first prediction.
- Test first exact score.
- Test 10 exact scores.
- Test 100 points.
- Test Top-10 tournament.
- Test tournament champion.
- Test 50 invited friends.
- Test duplicate prevention.

### Acceptance Criteria

- All MVP achievements are covered.

---

## Issue 94. Add tournament completion tests

**Labels:** `area:backend`, `area:tests`, `feature:rankings`, `feature:leagues`, `priority:p0`

### Description

Test manual tournament completion workflow.

### Tasks

- Test completion blocked when matches incomplete.
- Test tournament result snapshot.
- Test league result snapshots.
- Test league completion.
- Test idempotency.

### Acceptance Criteria

- Tournament completion is safe and repeatable.

---

## Issue 95. Add VIP tests

**Labels:** `area:backend`, `area:bot`, `area:tests`, `feature:vip`, `priority:p1`

### Description

Test VIP purchase and access lifecycle.

### Tasks

- Test payment confirmation.
- Test duplicate payment handling.
- Test premium expiry calculation.
- Test VIP question access.
- Test expired VIP denial.
- Test channel removal job with mocked Telegram API.

### Acceptance Criteria

- VIP behavior is covered without real payments.

---

## Issue 96. Add autoposting tests

**Labels:** `area:backend`, `area:bot`, `area:tests`, `feature:autoposting`, `priority:p1`

### Description

Test generated autoposting payloads and triggers.

### Tasks

- Test expert prediction post.
- Test match result post.
- Test tournament result post.
- Test league result post.
- Mock Telegram send calls.
- Test publication failure logging.

### Acceptance Criteria

- Autoposting is tested without real Telegram channel.

---

# Milestone 15: Release Readiness

## Issue 97. Add deployment checklist

**Labels:** `area:docs`, `priority:p1`

### Description

Document required setup before production launch.

### Tasks

- Document bot token setup.
- Document Mini App URL setup.
- Document Telegram Stars setup.
- Document VIP channel setup.
- Document discussion group linking.
- Document admin Telegram IDs.
- Document environment variables.

### Acceptance Criteria

- Operator can prepare Telegram resources using the checklist.

---

## Issue 98. Add production environment configuration

**Labels:** `area:infra`, `priority:p1`

### Description

Prepare environment configuration for production deployment.

### Tasks

- Add production env example.
- Configure CORS.
- Configure public frontend URL.
- Configure webhook or polling strategy.
- Configure database migrations on deploy.

### Acceptance Criteria

- Production config is documented.
- Secrets are not committed.

---

## Issue 99. Add basic security hardening

**Labels:** `area:backend`, `area:infra`, `priority:p1`

### Description

Apply baseline security controls.

### Tasks

- Validate all user input.
- Add rate limiting strategy for sensitive endpoints.
- Ensure admin endpoints require admin access.
- Avoid leaking stack traces.
- Sanitize logs.

### Acceptance Criteria

- Common abuse paths are documented and mitigated.

---

## Issue 100. Perform MVP end-to-end acceptance scenario

**Labels:** `area:tests`, `priority:p0`

### Description

Run full manual acceptance test from user onboarding to tournament completion.

### Tasks

- Create season.
- Create tournament.
- Create matches and questions.
- Register users.
- Submit predictions.
- Buy VIP with test flow or mocked flow.
- Create and join league.
- Complete matches.
- Complete tournament.
- Verify rankings.
- Verify league archive.
- Verify posts.
- Verify achievements.

### Acceptance Criteria

- Full MVP scenario passes.
- Blocking bugs are fixed or documented.

