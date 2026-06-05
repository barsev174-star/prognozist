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
- Admin match creation can select World Cup 2026 teams from a prepared list with visual flag icons.
- Normal players see a clear “no admin access” screen instead of an empty/broken admin area.
- Admin users page can list players, block/unblock them, edit VIP expiration, and grant test VIP access.
- Admin logs page shows system events and point-award records.

## Current Open Wishes

- Replace flag icons with official federation crests if real licensed team logos are needed.
- Show the player's VIP status directly in the app/home screen, not only inside the VIP/profile areas.
- Decide how to manage historical Telegram bot messages.
- Add stable hosting/public URL for real use instead of temporary ngrok links.

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
