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
