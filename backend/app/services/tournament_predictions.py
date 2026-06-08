from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    TournamentPrediction,
    TournamentPredictionOption,
    TournamentPredictionQuestion,
    TournamentPredictionQuestionStatus,
    TournamentPredictionResult,
    User,
)
from app.schemas.tournament_prediction import TournamentPredictionResolutionSummaryRead, TournamentPredictionResolve
from app.services.achievements import check_points_achievements
from app.services.scoring import award_points_once


def normalize_text_answer(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = " ".join(value.strip().split())
    return normalized.casefold() if normalized else None


def build_tournament_prediction_resolution_summary(
    db: Session,
    question_id: int,
) -> TournamentPredictionResolutionSummaryRead:
    predictions = db.scalars(select(TournamentPrediction).where(TournamentPrediction.question_id == question_id)).all()
    total_predictions = len(predictions)
    correct_predictions = sum(1 for prediction in predictions if (prediction.points_awarded or 0) > 0)
    total_points_awarded = sum(prediction.points_awarded or 0 for prediction in predictions)
    return TournamentPredictionResolutionSummaryRead(
        total_predictions=total_predictions,
        correct_predictions=correct_predictions,
        total_points_awarded=total_points_awarded,
    )


def resolve_tournament_prediction_question(
    db: Session,
    question: TournamentPredictionQuestion,
    payload: TournamentPredictionResolve,
    resolved_by_user_id: int | None,
) -> TournamentPredictionQuestion:
    if question.status == TournamentPredictionQuestionStatus.resolved:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question is already resolved")
    if question.status in {TournamentPredictionQuestionStatus.draft, TournamentPredictionQuestionStatus.cancelled}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question cannot be resolved in current status")

    correct_option_id = payload.correct_option_id
    correct_text = payload.correct_text.strip() if payload.correct_text else None

    if correct_option_id is None and not correct_text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Correct answer is required")

    options = list(question.options)
    if options and correct_option_id is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Correct option is required")

    correct_option: TournamentPredictionOption | None = None
    if correct_option_id is not None:
        correct_option = db.get(TournamentPredictionOption, correct_option_id)
        if correct_option is None or correct_option.question_id != question.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament prediction option not found")
        if not correct_text:
            correct_text = correct_option.label

    resolved_at = datetime.now(UTC)
    result = question.result
    if result is None:
        result = TournamentPredictionResult(question_id=question.id)
        db.add(result)
        question.result = result

    result.correct_option_id = correct_option.id if correct_option is not None else None
    result.correct_text = correct_text
    result.resolved_by_user_id = resolved_by_user_id
    result.resolved_at = resolved_at

    normalized_correct_text = normalize_text_answer(correct_text)
    predictions = db.scalars(select(TournamentPrediction).where(TournamentPrediction.question_id == question.id)).all()
    for prediction in predictions:
        is_correct = False
        if correct_option is not None:
            is_correct = prediction.selected_option_id == correct_option.id
        elif normalized_correct_text is not None:
            is_correct = normalize_text_answer(prediction.free_text) == normalized_correct_text

        points = question.points if is_correct else 0
        prediction.points_awarded = points
        prediction.resolved_at = resolved_at
        award_points_once(
            db=db,
            user_id=prediction.user_id,
            source_type="tournament_prediction",
            source_id=prediction.id,
            points=points,
        )
        user = db.get(User, prediction.user_id)
        if user is not None:
            check_points_achievements(db, user)

    question.status = TournamentPredictionQuestionStatus.resolved
    question.resolved_at = resolved_at
    db.flush()
    return question
