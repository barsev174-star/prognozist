# Product Notes

## Implemented Feedback

- Telegram Mini App works locally through one ngrok URL pointed at frontend port `3000`.
- Backend API works behind the same public URL through frontend `/api/v1` rewrite.
- Home screen shows the player's VIP status.
- Home screen no longer duplicates VIP navigation; the status card is the entry point.
- VIP page shows real status, benefits, and activation instructions instead of a placeholder.
- Bot softly deletes the player's `/start` command message; important bot replies are kept.
- Match list shows each player's submitted prediction/question progress per match.
- Admin match list shows whether questions are fully prepared before match selection.
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
- Normal players see a clear no-admin-access screen instead of an empty/broken admin area.
- Admin users page can list players, block/unblock them, edit VIP expiration, and grant test VIP access.
- Admin logs page shows system events and point-award records.
- Admin navigation now has one `Пользователи` entry in the sections row; the duplicate dark quick button was removed.

- Admin expert page can create/update an expert prediction, show related match questions, and publish the expert prediction to the VIP channel.

## Current Open Wishes

- Move from temporary ngrok URLs to stable hosting or a reserved domain.
- Replace flag icons with official federation crests if real licensed team logos are needed.
- Decide whether to expand message cleanup beyond `/start` after more Telegram testing.
- Improve production readiness: secrets, backups, monitoring, real domain, and deploy instructions.
- Decide whether expert predictions need separate answers for both public questions; currently the expert answer maps to the first public question.

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
- repeated open-app prompts.

Current implementation only deletes the player's `/start` command message. Expanding cleanup needs careful testing because deleting too aggressively can remove information players may need later.

## Manual Testing Focus

- Start from Telegram `/start` after every tunnel URL change, because old buttons can point to old URLs.
- Create several random players from `http://localhost:3000/dev-login`.
- For each player, enter the app with `Войти как игрок`.
- Make predictions for upcoming matches.
- Answer two public questions.
- Verify non-VIP users can see VIP question text but cannot answer.
- Complete a match in admin and verify points breakdown, ranking, and match status.
- Check leagues with multiple players and edited prize text.
- Check admin users: grant VIP, remove VIP, block/unblock a non-admin player.
- Check admin logs after VIP/admin/match actions.
