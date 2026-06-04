from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.predictions import ensure_match_accepts_predictions
from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Match, Question, QuestionAnswer, User, VipQuestion, VipQuestionAnswer
from app.schemas.answer import AnswerCreate, QuestionAnswerRead, VipQuestionAnswerRead

router = APIRouter(prefix="/questions", tags=["Questions"])


def ensure_active_vip(user: User) -> None:
    if user.premium_until is None or user.premium_until <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active VIP is required")


@router.post("/{question_id}/answer", response_model=QuestionAnswerRead)
def answer_public_question(
    question_id: int,
    payload: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestionAnswer:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    match = db.get(Match, question.match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    ensure_match_accepts_predictions(match)

    answer = db.scalar(
        select(QuestionAnswer).where(
            QuestionAnswer.user_id == current_user.id,
            QuestionAnswer.question_id == question.id,
        )
    )

    if answer is None:
        answer = QuestionAnswer(user_id=current_user.id, question_id=question.id, answer=payload.answer)
        db.add(answer)
    else:
        answer.answer = payload.answer

    db.commit()
    db.refresh(answer)
    return answer


@router.post("/vip/{question_id}/answer", response_model=VipQuestionAnswerRead)
def answer_vip_question(
    question_id: int,
    payload: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VipQuestionAnswer:
    ensure_active_vip(current_user)

    question = db.get(VipQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VIP question not found")

    match = db.get(Match, question.match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    ensure_match_accepts_predictions(match)

    answer = db.scalar(
        select(VipQuestionAnswer).where(
            VipQuestionAnswer.user_id == current_user.id,
            VipQuestionAnswer.vip_question_id == question.id,
        )
    )

    if answer is None:
        answer = VipQuestionAnswer(user_id=current_user.id, vip_question_id=question.id, answer=payload.answer)
        db.add(answer)
    else:
        answer.answer = payload.answer

    db.commit()
    db.refresh(answer)
    return answer

