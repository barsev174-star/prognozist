# Product Notes

Last updated: 2026-06-09.

## What Is Working Well

- Production is live and usable on `https://prognozistapp.ru`.
- HTTPS, backend health, bot polling, Mini App launch, and admin login are working.
- Telegram Stars VIP flow is already in place.
- Telegram Stars donations were added as the next monetization layer.
- First-stage Stars admin visibility now exists:
  - current balance
  - recent transactions
  - donation logs
- Admin tooling is much more practical now:
  - users
  - logs
  - questions
  - expert flow
- Player match flow is in solid shape:
  - list of matches
  - prediction form
  - public questions
  - VIP question visibility
  - completed match points breakdown
- Tournament prediction flow is now present in production:
  - admin screen
  - player tournament hub
  - player long-term answers
  - admin resolution with points award summary
- Referrals now have a live player-facing page with share/copy actions and real counters.
- Support now has a basic Mini App form instead of only a chat-side hint.

## Product Direction Right Now

The best current release strategy is:

1. finish release polish for first impression;
2. remove rough edges in leagues UX;
3. confirm payments are stable and understandable;
4. keep operations safe enough for first real users.

This is better than spreading effort across too many new features.

Updated tactical priority after the latest deploy:

1. smooth leagues sharing and ranking UX;
2. verify the newly wired bot entry points on real Telegram clients;
3. validate Stars/support flows in production with real admin delivery;
4. clean test data from production safely before launch;
5. continue visual polish after the bigger UX gaps above are reduced.

## Release Polish Notes

The app was visually clean before, but too generic.

The current polish direction is:

- more atmospheric backgrounds;
- stronger hero sections;
- better information hierarchy;
- more "match event" feeling on match cards;
- more premium-looking VIP presentation;
- more game-like ranking presentation.

Important constraint:

- do not redesign the product from scratch;
- keep the user flows recognizable;
- prefer targeted strengthening of key screens.

Polish target screens:

- home
- matches list
- match prediction page
- rankings
- VIP
- leagues shell
- profile
- referrals

Recent local polish note:

- the match prediction block on mobile now places the score inputs on a separate row under the team names so long team names do not crush the layout.

## Important Technical Note About Russian Text

There were two different text problems during recent work:

1. classic mojibake from encoding-damaged files;
2. literal `\u041c...` strings rendered in the UI.

These are not the same issue.

The second issue happens when Unicode escapes are placed directly into raw JSX string attributes or text nodes, for example:

```tsx
<AppHeader title="\u041c\u0430\u0442\u0447\u0438" />
```

That renders the backslash sequence literally.

Safe pattern:

```tsx
<AppHeader title={"\u041c\u0430\u0442\u0447\u0438"} />
```

or use a constant/expression.

Practical note from local testing:

- if old test users were created while text encoding was already damaged, those saved names can keep showing mojibake in logs until the records are refreshed or replaced.

## Monetization Notes

### Current position

For this product inside Telegram, the right release focus is Telegram Stars, not card payments.

Why:

- VIP and donations are digital goods/support flows inside Telegram;
- Stars fit the in-Telegram product path much better;
- card payments would likely require an external web payment funnel and more operational complexity.

### Already implemented

- VIP Stars invoice flow
- donation Stars flow
- fixed donation amounts
- custom donation amount
- backend donation persistence and logging
- first-stage admin view of Stars balance and recent transactions
- Mini App can now reopen the saved VIP private-channel invite link for an active subscriber when the link exists.

### Still needed

- final real donation end-to-end validation;
- possibly richer donation reporting in admin later.

## VIP Notes

VIP remains one of the clearest value levers in the product.

Current value framing:

- one VIP question per match;
- extra points for correct VIP answers;
- private VIP channel distribution with invite-link recovery inside the Mini App.
- expert forecast publication into the VIP channel;
- automatic post after match completion with:
  - final score;
  - public/VIP answers;
  - audience average prediction;
  - comparison against expert forecast.

Still important:

- verify the real production channel path end to end:
  - bot creates invite links;
  - bot can publish into the channel;
  - active VIP user can reopen the stored invite link later from the Mini App.
- manual expert publication must never show as "published" if the VIP channel is not configured or unavailable.

## Leagues Notes

Leagues are promising and the backend is already ahead of the UI.

What already exists:

- league creation
- invite-code join
- backend endpoint for league ranking
- Mini App share button for league invites
- Mini App copy button for invite code
- in-league ranking block inside each league card
- safe local fallback: if frontend bot username is not configured, share no longer opens the raw web app URL and prefers Telegram text-only sharing instead

Implementation note:

- league ranking is not a heavy backend task anymore;
- zero-point members should stay visible so new league players do not disappear from the table;
- the next optional step is a deeper Telegram deep-link/auto-join flow, not the basic share UX itself.

## Retention Notes

Current practical step:

- use in-app visibility first, not bot spam;
- home now shows counters for pending match actions and unanswered tournament prediction questions;
- match cards and tournament cards now surface `NEW` / pending counts where needed.
- home counters now fail softly per section: if tournament summary fails, match reminders still stay visible.
- pending counters must track only answerable items; locked match/tournament questions should not be treated as new work.

Future wishlist:

- daily bot reminders for players who still have unanswered actions;
- keep this for later, after real-device validation of the current counters.

## Tournament Prediction Notes

Long-term tournament predictions now have a usable product loop:

- admin can create and edit tournament-wide questions;
- players can answer them in the Mini App;
- admin can resolve a question and trigger one-shot scoring;
- admin sees a quick summary after scoring:
  - how many users guessed correctly;
  - how many total points were awarded;
- player sees personal awarded points on resolved tournament questions.

Next useful improvement:

- add per-question answer analytics/history if moderation or audit needs grow later.

Current known issue after production deploy:

- creating a tournament prediction question shows a failure message in admin;
- likely local root cause found: missing `TournamentPredictionQuestionStatus` import inside `backend/app/api/v1/admin.py`;
- fix exists locally in the main workspace and should be committed/deployed through the safe Git path.

## Teams / Tournament Data Notes

Current team handling is still transitional.

What exists:

- World Cup 2026 team list support in admin creation flow
- one-click team seeding in admin
- visible team-directory refresh action in admin even when the directory is not empty
- Russian team names plus flag-based logos in the default seed
- old matches can now inherit fresh Russian names/flag logos from the linked team records after the directory is refreshed

What should happen next:

- move toward structured team records in the database;
- seed World Cup 2026 participants cleanly;
- decide on safe logo/licensing strategy.

## Operations Notes

Baseline operations readiness improved a lot:

- backup script
- restore script
- nightly wrapper
- retention cleanup
- production smoke check
- operations documentation

Still missing for stronger launch safety:

- cron verification
- off-server backup copy
- external monitoring/alerts

## Bot UX Notes

Current `/start` behavior is now much closer to the menu it shows, but still needs real-client validation after deploy.

What exists:

- `/start` opens a reply keyboard
- a separate inline Mini App button is sent
- VIP and donation buttons are handled
- ranking / leagues / referrals buttons now reopen Mini App directly in the relevant section
- support button now opens the Mini App support form instead of staying dead
- Telegram menu button can now be pinned to the Mini App from the bot process
- the redundant reply-keyboard `Открыть приложение` button was removed because it was the most visible broken entry point
- direct section entry now can restore Telegram auth instead of depending on the home page to create the session token

What is still weak:

- Mini App opened outside Telegram is expected to fail because Telegram init data is missing
- the new bot-driven section entry flow still needs one more pass on real Telegram clients after the next safe deploy

Important product note:

- this is not solved by customizing the message input field itself;
- the right tools are reply keyboard, inline buttons, menu button, and deep links.

Good near-term improvement:

- keep every visible button working;
- if onboarding needs another step up later, add deep-link/start-param routing instead of trying to overload chat input UX.

## Production Data Cleanup Notes

Before a wider launch, production should get a controlled cleanup pass.

Goal:

- remove test gameplay and test users;
- keep required admins and only the reference data that should survive launch.

This is not especially hard technically, but it is easy to do dangerously.

Safe pattern:

1. create PostgreSQL backup;
2. inspect current row counts and keep-list;
3. delete only approved categories of test data;
4. rerun health checks.

## Local QA Notes

Important local reading for beginner-friendly debugging:

- if one changed feature appears after rebuild, Docker most likely did pick up the latest code;
- in the recent local test, changed counters proved the rebuild was real, so the remaining issues were actual code paths, not "Docker ignored the update";
- literal `\u041f...` on screen points to a JSX rendering mistake, not browser cache;
- English team names after rebuild can mean the old teams directory still needs a manual refresh from admin.

## Current Best Next Steps

Priority order:

1. commit/deploy the local tournament-question admin fix together with the bot/menu cleanup batch;
2. verify bot section buttons, support entry, and Telegram menu button on real devices after deploy;
3. run one real production smoke test for Stars balance visibility and support delivery;
4. prepare and execute safe production data cleanup;
5. continue release polish in the actual Mini App;
6. decide later whether league invites need a deeper Telegram auto-join link.

## Wishlist

- daily bot reminders for players with unanswered match/tournament actions;
- World Cup 2026 standings tables with points, goals for/against, wins, draws, and losses.
- expert/VIP channel flow should be redesigned:
  - admin prepares match, questions, and expert answers before kickoff;
  - expert forecast post should appear automatically at match start, when player answers are already locked;
  - match completion should publish a separate richer result post after admin presses "complete and score";
  - optional manual "publish" button may stay, but it must not imply that the match is completed.
- VIP channel post templates need a more lively tone and better discussion-oriented formatting.
- match cards still need one more mobile/layout pass so the `NEW` badge does not push team names out of balance.
- manual VIP grant from admin needs a clearer channel-access flow:
  - either show the invite link reliably inside the VIP tab;
  - or let admin generate/send a fresh invite path for the channel;
  - also decide the correct removal policy when VIP expires.

## Handoff Reminder For Future Sessions

Any future session should be warned about Git behavior immediately:

- the main workspace `.git` can fail on `index.lock`;
- commits are often safer from `.codex-push-check`;
- changes are usually made in the main workspace first, then copied to the service clone for commit/push;
- always inspect current status before committing;
- never assume the service clone branch is the same as `main` without checking.

Minimal handoff checklist:

```powershell
git status --short --branch
docker compose ps
git -C ".codex-push-check" status --short --branch
```
