# Product Notes

## 2026-06-04 Manual Test Feedback

Status: captured, not implemented yet.

### Match Questions

- Each match should have two public questions and one VIP question.
- Public question 1 stays as the current base question, for example: "Both teams will score?"
- Public question 2 should cover a match event and award 3 points, for example: "Will there be a penalty?", "Will there be a red card?", or another event-style yes/no question.
- VIP question stays unchanged.

Implementation impact:

- Current database schema allows only one public question per match through `uq_questions_match`.
- Backend match detail currently returns `public_question`, not a list of public questions.
- Frontend prediction form currently renders one public question.
- Scoring currently scores one public question per match.
- Admin match completion currently accepts one `public_correct_answer`; it must support answers for both public questions.

### Admin Match Completion

- When completing a match, admin must see the question texts next to each yes/no answer selector.
- Current UI only shows generic answer selectors, so it is unclear which question is being answered.

Expected fix:

- Show public question 1 text, public question 2 text, and VIP question text in the completion form.
- Keep yes/no answer controls next to each visible question.

### Current Test Result

- Basic local flow works: Docker, migrations, backend health, frontend, user prediction, match completion, and ranking behavior are otherwise correct.

## 2026-06-04 Follow-up Feedback

Status: partially implemented.

### Implemented

- VIP question text should be visible to all players, while answering remains available only to active VIP users.
- Match question cards should show how many points each public or VIP question awards.
- The home page should include a logout button for local testing with multiple users.

### To Implement

- League owners should be able to edit the league prize after creation.
- League members should clearly see the current prize before and after joining, because the prize may need to be agreed with players after the league is created.
- Add team logos for World Cup 2026 teams and make match creation faster by selecting a team/logo pair instead of pasting logo URLs manually.
- Decide how to manage historical Telegram bot messages. Possible directions: delete some user commands, delete outdated bot replies after a delay, or keep important result/payment messages permanently.

### Product Notes

- Prize editing should probably be owner-only and blocked or audited after tournament/league completion.
- Bot message cleanup needs a policy before implementation, because deleting too much can remove payment, prediction, or result confirmations that players may need later.
