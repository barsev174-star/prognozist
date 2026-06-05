# Product Notes

## Implemented Feedback

- Each match supports two public questions and one VIP question.
- Public questions and VIP questions are visible in admin match completion before selecting correct answers.
- The admin questions page shows three separate fields: public question 1, public question 2, and VIP question.
- VIP question text is visible to all players, but only active VIP users can answer it.
- Question cards show how many points can be earned.
- Completed match cards can show how many points the player earned for score, public questions, and VIP question.
- Local testing supports logout and dev login.
- Dev login can create random players with random display names.
- League owners can edit prize description.
- League members can see prize description.
- Frontend can work through one ngrok URL by proxying `/api/v1` to backend.

## Current Open Wishes

- Add team logos for World Cup 2026 teams.
- Make match creation faster by selecting teams from a list with prepared logos instead of manually pasting logo URLs.
- Decide how to manage historical Telegram bot messages.
- Add stable hosting/public URL for real use instead of temporary ngrok links.
- Improve normal-player behavior on `/admin`: currently a normal user may see admin navigation but cannot load protected data. A clearer “not admin” screen would be better.

## Bot Message Cleanup Policy Draft

Keep:

- prediction confirmations;
- payment/VIP confirmations;
- match result messages;
- point/ranking result messages.

Consider deleting after a delay:

- `/start` command messages from the player;
- temporary bot help/navigation replies;
- obsolete error messages;
- repeated “open app” prompts.

This needs careful implementation because deleting too aggressively can remove information players may need later.

## Manual Testing Focus

- Create several random players from `http://localhost:3000/dev-login`.
- For each player, enter the app with `Войти как игрок`.
- Make predictions for upcoming matches.
- Answer two public questions.
- Verify non-VIP users can see VIP question text but cannot answer.
- Complete a match in admin and verify points breakdown, ranking, and match status.
- Check leagues with multiple players and edited prize text.
