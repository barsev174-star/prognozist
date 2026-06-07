# Product Notes

Last updated: 2026-06-08.

## What Is Working Well

- Production is live and usable on `https://prognozistapp.ru`.
- HTTPS, backend health, bot polling, Mini App launch, and admin login are working.
- Telegram Stars VIP flow is already in place.
- Telegram Stars donations were added as the next monetization layer.
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

## Product Direction Right Now

The best current release strategy is:

1. finish release polish for first impression;
2. remove rough edges in leagues UX;
3. confirm payments are stable and understandable;
4. keep operations safe enough for first real users.

This is better than spreading effort across too many new features.

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

### Still needed

- final real donation end-to-end validation;
- possibly richer donation reporting in admin later.

## VIP Notes

VIP remains one of the clearest value levers in the product.

Current value framing:

- one VIP question per match;
- extra points for correct VIP answers;
- future/optional VIP channel distribution.

Still important:

- finish VIP channel/community decision and setup;
- verify invite/publication flows when that channel is enabled.

## Leagues Notes

Leagues are promising, but still feel semi-admin in one crucial place:

- creation still requires raw `tournament_id`.

This is one of the biggest UX blockers before broader player onboarding.

Desired fix:

- tournament selection by name, not raw id.

## Teams / Tournament Data Notes

Current team handling is still transitional.

What exists:

- World Cup 2026 team list support in admin creation flow
- logo/flag-based placeholders

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

## Current Best Next Steps

Priority order:

1. finish and verify release polish in the actual Mini App;
2. fix leagues `tournament_id` UX;
3. prepare structured team/tournament data improvements;
4. run real donation smoke test;
5. tighten monitoring/backup automation.

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
