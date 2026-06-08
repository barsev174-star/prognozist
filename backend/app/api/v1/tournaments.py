from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import (
    Tournament,
    TournamentPrediction,
    TournamentPredictionOption,
    TournamentPredictionQuestion,
    TournamentPredictionQuestionStatus,
    TournamentStatus,
    User,
)
from app.schemas.tournament import TournamentRead
from app.schemas.tournament_prediction import (
    TournamentPredictionAnswerCreate,
    TournamentPredictionQuestionRead,
    TournamentPredictionQuestionWithUserRead,
    TournamentPredictionRead,
)

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])


def ensure_question_accepts_predictions(question: TournamentPredictionQuestion) -> None:
    if question.status != TournamentPredictionQuestionStatus.active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question is not accepting predictions")
    if question.lock_at is not None and question.lock_at <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question is locked")


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


@router.get(
    "/{tournament_id}/prediction-questions/mine",
    response_model=list[TournamentPredictionQuestionWithUserRead],
)
def list_my_tournament_prediction_questions(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TournamentPredictionQuestionWithUserRead]:
    if db.get(Tournament, tournament_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    questions = list(
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
    predictions = {
        prediction.question_id: prediction
        for prediction in db.scalars(
            select(TournamentPrediction).where(
                TournamentPrediction.user_id == current_user.id,
                TournamentPrediction.question_id.in_([question.id for question in questions]),
            )
        )
    }

    return [
        TournamentPredictionQuestionWithUserRead(
            **TournamentPredictionQuestionRead.model_validate(question).model_dump(),
            user_prediction=TournamentPredictionRead.model_validate(predictions[question.id])
            if question.id in predictions
            else None,
        )
        for question in questions
    ]


@router.post(
    "/tournament-prediction-questions/{question_id}/answer",
    response_model=TournamentPredictionRead,
)
def create_or_update_tournament_prediction(
    question_id: int,
    payload: TournamentPredictionAnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TournamentPrediction:
    question = db.get(TournamentPredictionQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament prediction question not found")

    ensure_question_accepts_predictions(question)

    selected_option_id = payload.selected_option_id
    free_text = payload.free_text.strip() if payload.free_text else None
    if selected_option_id is None and not free_text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Answer is required")

    if selected_option_id is not None:
        option = db.get(TournamentPredictionOption, selected_option_id)
        if option is None or option.question_id != question.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament prediction option not found")

    prediction = db.scalar(
        select(TournamentPrediction).where(
            TournamentPrediction.user_id == current_user.id,
            TournamentPrediction.question_id == question.id,
        )
    )

    if prediction is None:
        prediction = TournamentPrediction(
            question_id=question.id,
            user_id=current_user.id,
            selected_option_id=selected_option_id,
            free_text=free_text,
        )
        db.add(prediction)
    else:
        prediction.selected_option_id = selected_option_id
        prediction.free_text = free_text

    db.commit()
    db.refresh(prediction)
    return prediction
