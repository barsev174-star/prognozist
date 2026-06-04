from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Match, Prediction, User
from app.schemas.prediction import PredictionCreate, PredictionRead
from app.services.achievements import check_prediction_achievements
from app.services.referrals import activate_referral_after_first_prediction

router = APIRouter(prefix="/predictions", tags=["Predictions"])


def ensure_match_accepts_predictions(match: Match) -> None:
    if match.start_time <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match has already started")


@router.post("", response_model=PredictionRead)
def create_or_update_prediction(
    payload: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Prediction:
    match = db.get(Match, payload.match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    ensure_match_accepts_predictions(match)

    prediction = db.scalar(
        select(Prediction).where(
            Prediction.user_id == current_user.id,
            Prediction.match_id == payload.match_id,
        )
    )

    is_first_prediction = db.scalar(select(Prediction.id).where(Prediction.user_id == current_user.id).limit(1)) is None

    if prediction is None:
        prediction = Prediction(
            user_id=current_user.id,
            match_id=payload.match_id,
            predicted_team_1_score=payload.predicted_team_1_score,
            predicted_team_2_score=payload.predicted_team_2_score,
        )
        db.add(prediction)
        db.flush()
    else:
        prediction.predicted_team_1_score = payload.predicted_team_1_score
        prediction.predicted_team_2_score = payload.predicted_team_2_score

    if is_first_prediction:
        check_prediction_achievements(db, current_user.id)
        activate_referral_after_first_prediction(db, current_user)

    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/{match_id}/mine", response_model=PredictionRead | None)
def get_my_prediction(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Prediction | None:
    return db.scalar(
        select(Prediction).where(
            Prediction.user_id == current_user.id,
            Prediction.match_id == match_id,
        )
    )
