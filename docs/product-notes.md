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

Still important:

- verify the real production channel path end to end:
  - bot creates invite links;
  - bot can publish into the channel;
  - active VIP user can reopen the stored invite link later from the Mini App.

## Leagues Notes

Leagues are promising, but still feel semi-admin in one crucial place:

- joining still requires manual copy/paste of the invite code.

This is still a UX rough edge before broader player onboarding.

Desired fix:

- add a cleaner share flow for the invite code from the Mini App.

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
