from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Match, MatchStatus, Question, User, VipQuestion
from app.schemas.match import MatchDetailRead, MatchRead

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get("", response_model=list[MatchRead])
def list_matches(
    tournament_id: int | None = None,
    match_status: MatchStatus | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Match]:
    query = select(Match).order_by(Match.start_time.asc(), Match.id.asc())
    if tournament_id is not None:
        query = query.where(Match.tournament_id == tournament_id)
    if match_status is not None:
        query = query.where(Match.status == match_status)
    return list(db.scalars(query))


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
