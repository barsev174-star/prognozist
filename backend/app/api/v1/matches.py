from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
import sqlalchemy as sa
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Match, MatchStatus, Prediction, Question, QuestionAnswer, User, VipQuestion, VipQuestionAnswer
from app.schemas.match import MatchDetailRead, MatchPointsBreakdownItem, MatchPointsBreakdownRead, MatchRead
from app.services.scoring import SCORE_EXACT_POINTS

router = APIRouter(prefix="/matches", tags=["Matches"])


def format_bool_answer(value: bool | None) -> str | None:
    if value is None:
        return None
    return "Да" if value else "Нет"


def build_match_read(match: Match, db: Session, current_user: User) -> MatchRead:
    public_question_ids = list(db.scalars(select(Question.id).where(Question.match_id == match.id)))
    vip_question_id = db.scalar(select(VipQuestion.id).where(VipQuestion.match_id == match.id))
    prediction_exists = db.scalar(
        select(Prediction.id).where(Prediction.match_id == match.id, Prediction.user_id == current_user.id)
    )
    public_answers_count = 0
    if public_question_ids:
        public_answers_count = db.scalar(
            select(sa.func.count())
            .select_from(QuestionAnswer)
            .where(QuestionAnswer.user_id == current_user.id, QuestionAnswer.question_id.in_(public_question_ids))
        ) or 0
    vip_answer_exists = False
    if vip_question_id is not None:
        vip_answer_exists = (
            db.scalar(
                select(VipQuestionAnswer.id).where(
                    VipQuestionAnswer.vip_question_id == vip_question_id,
                    VipQuestionAnswer.user_id == current_user.id,
                )
            )
            is not None
        )

    data = MatchRead.model_validate(match).model_dump()
    data.update(
        user_prediction_submitted=prediction_exists is not None,
        user_public_answers_count=public_answers_count,
        user_vip_answer_submitted=vip_answer_exists,
        public_questions_count=len(public_question_ids),
        vip_question_exists=vip_question_id is not None,
    )
    return MatchRead(**data)


@router.get("", response_model=list[MatchRead])
def list_matches(
    tournament_id: int | None = None,
    match_status: MatchStatus | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MatchRead]:
    query = select(Match).order_by(Match.start_time.asc(), Match.id.asc())
    if tournament_id is not None:
        query = query.where(Match.tournament_id == tournament_id)
    if match_status is not None:
        query = query.where(Match.status == match_status)
    return [build_match_read(match, db, current_user) for match in db.scalars(query)]


@router.get("/{match_id}", response_model=MatchDetailRead)
def get_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MatchDetailRead:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    public_questions = list(db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc())))
    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))
    has_vip = current_user.premium_until is not None and current_user.premium_until > datetime.now(UTC)

    match_data = MatchRead.model_validate(match).model_dump()
    return MatchDetailRead(
        **match_data,
        public_questions=public_questions,
        public_question=public_questions[0] if public_questions else None,
        vip_question=vip_question,
        vip_question_locked=not has_vip and vip_question is not None,
    )


@router.get("/{match_id}/points-breakdown", response_model=MatchPointsBreakdownRead)
def get_match_points_breakdown(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MatchPointsBreakdownRead:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    if match.status != MatchStatus.completed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match is not completed")

    items: list[MatchPointsBreakdownItem] = []
    prediction = db.scalar(
        select(Prediction).where(
            Prediction.match_id == match.id,
            Prediction.user_id == current_user.id,
        )
    )
    if prediction is None:
        items.append(
            MatchPointsBreakdownItem(
                type="score_prediction",
                title="Точный счёт",
                user_answer=None,
                correct_answer=f"{match.team_1_score}:{match.team_2_score}",
                is_correct=False,
                points_awarded=0,
                max_points=SCORE_EXACT_POINTS,
            )
        )
    else:
        items.append(
            MatchPointsBreakdownItem(
                type="score_prediction",
                title="Прогноз счёта",
                user_answer=f"{prediction.predicted_team_1_score}:{prediction.predicted_team_2_score}",
                correct_answer=f"{match.team_1_score}:{match.team_2_score}",
                is_correct=prediction.points_awarded > 0,
                points_awarded=prediction.points_awarded,
                max_points=SCORE_EXACT_POINTS,
            )
        )

    questions = db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc())).all()
    for question in questions:
        answer = db.scalar(
            select(QuestionAnswer).where(
                QuestionAnswer.question_id == question.id,
                QuestionAnswer.user_id == current_user.id,
            )
        )
        items.append(
            MatchPointsBreakdownItem(
                type="public_question",
                title=f"Публичный вопрос {question.slot}",
                user_answer=format_bool_answer(answer.answer) if answer is not None else None,
                correct_answer=format_bool_answer(question.correct_answer),
                is_correct=answer.is_correct if answer is not None else False,
                points_awarded=answer.points_awarded if answer is not None else 0,
                max_points=question.points,
            )
        )

    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))
    if vip_question is not None:
        vip_answer = db.scalar(
            select(VipQuestionAnswer).where(
                VipQuestionAnswer.vip_question_id == vip_question.id,
                VipQuestionAnswer.user_id == current_user.id,
            )
        )
        items.append(
            MatchPointsBreakdownItem(
                type="vip_question",
                title="VIP-вопрос",
                user_answer=format_bool_answer(vip_answer.answer) if vip_answer is not None else None,
                correct_answer=format_bool_answer(vip_question.correct_answer),
                is_correct=vip_answer.is_correct if vip_answer is not None else False,
                points_awarded=vip_answer.points_awarded if vip_answer is not None else 0,
                max_points=vip_question.points,
            )
        )

    return MatchPointsBreakdownRead(
        match_id=match.id,
        total_points=sum(item.points_awarded for item in items),
        items=items,
    )
