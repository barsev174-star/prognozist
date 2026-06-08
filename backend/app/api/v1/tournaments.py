from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models import (
    Tournament,
    TournamentPredictionOption,
    TournamentPredictionQuestion,
    TournamentPredictionQuestionStatus,
    TournamentStatus,
)
from app.schemas.tournament import TournamentRead
from app.schemas.tournament_prediction import TournamentPredictionQuestionRead

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])


@router.get("", response_model=list[TournamentRead])
def list_public_tournaments(db: Session = Depends(get_db)) -> list[Tournament]:
    return list(
        db.scalars(
            select(Tournament)
            .where(Tournament.status.in_([TournamentStatus.active, TournamentStatus.upcoming]))
            .order_by(Tournament.start_date.asc(), Tournament.id.asc())
        )
    )


@router.get("/{tournament_id}/prediction-questions", response_model=list[TournamentPredictionQuestionRead])
def list_tournament_prediction_questions(
    tournament_id: int,
    db: Session = Depends(get_db),
) -> list[TournamentPredictionQuestion]:
    if db.get(Tournament, tournament_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    return list(
        db.scalars(
            select(TournamentPredictionQuestion)
            .options(
                selectinload(TournamentPredictionQuestion.options).selectinload(TournamentPredictionOption.team),
                selectinload(TournamentPredictionQuestion.result),
            )
            .where(
                TournamentPredictionQuestion.tournament_id == tournament_id,
                TournamentPredictionQuestion.status != TournamentPredictionQuestionStatus.draft,
            )
            .order_by(TournamentPredictionQuestion.lock_at.asc(), TournamentPredictionQuestion.id.asc())
        )
    )
