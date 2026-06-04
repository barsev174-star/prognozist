from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Match,
    PointsLog,
    Prediction,
    Question,
    QuestionAnswer,
    User,
    VipQuestion,
    VipQuestionAnswer,
)
from app.services.achievements import check_points_achievements, check_prediction_achievements

SCORE_EXACT_POINTS = 10
SCORE_OUTCOME_POINTS = 3


@dataclass(frozen=True)
class ScorePredictionResult:
    points: int
    is_exact_score: bool
    is_outcome_correct: bool


def get_outcome(team_1_score: int, team_2_score: int) -> int:
    if team_1_score > team_2_score:
        return 1
    if team_1_score < team_2_score:
        return 2
    return 0


def score_prediction(
    predicted_team_1_score: int,
    predicted_team_2_score: int,
    actual_team_1_score: int,
    actual_team_2_score: int,
) -> ScorePredictionResult:
    is_exact_score = (
        predicted_team_1_score == actual_team_1_score
        and predicted_team_2_score == actual_team_2_score
    )
    if is_exact_score:
        return ScorePredictionResult(
            points=SCORE_EXACT_POINTS,
            is_exact_score=True,
            is_outcome_correct=True,
        )

    is_outcome_correct = get_outcome(predicted_team_1_score, predicted_team_2_score) == get_outcome(
        actual_team_1_score,
        actual_team_2_score,
    )
    return ScorePredictionResult(
        points=SCORE_OUTCOME_POINTS if is_outcome_correct else 0,
        is_exact_score=False,
        is_outcome_correct=is_outcome_correct,
    )


def score_yes_no_answer(answer: bool, correct_answer: bool, points: int) -> int:
    return points if answer == correct_answer else 0


def score_completed_match(db: Session, match: Match) -> None:
    if match.team_1_score is None or match.team_2_score is None:
        raise ValueError("Match score is required before scoring")

    predictions = db.scalars(select(Prediction).where(Prediction.match_id == match.id)).all()
    for prediction in predictions:
        result = score_prediction(
            prediction.predicted_team_1_score,
            prediction.predicted_team_2_score,
            match.team_1_score,
            match.team_2_score,
        )
        prediction.points_awarded = result.points
        prediction.is_exact_score = result.is_exact_score
        prediction.is_outcome_correct = result.is_outcome_correct
        award_points_once(
            db=db,
            user_id=prediction.user_id,
            source_type="score_prediction",
            source_id=prediction.id,
            points=result.points,
        )
        user = db.get(User, prediction.user_id)
        if user is not None:
            check_prediction_achievements(db, user.id)
            check_points_achievements(db, user)

    questions = db.scalars(select(Question).where(Question.match_id == match.id)).all()
    for question in questions:
        if question.correct_answer is None:
            continue
        answers = db.scalars(select(QuestionAnswer).where(QuestionAnswer.question_id == question.id)).all()
        for answer in answers:
            points = score_yes_no_answer(answer.answer, question.correct_answer, question.points)
            answer.is_correct = points > 0
            answer.points_awarded = points
            award_points_once(
                db=db,
                user_id=answer.user_id,
                source_type="public_question_answer",
                source_id=answer.id,
                points=points,
            )
            user = db.get(User, answer.user_id)
            if user is not None:
                check_points_achievements(db, user)

    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))
    if vip_question is not None and vip_question.correct_answer is not None:
        answers = db.scalars(
            select(VipQuestionAnswer).where(VipQuestionAnswer.vip_question_id == vip_question.id)
        ).all()
        for answer in answers:
            points = score_yes_no_answer(answer.answer, vip_question.correct_answer, vip_question.points)
            answer.is_correct = points > 0
            answer.points_awarded = points
            award_points_once(
                db=db,
                user_id=answer.user_id,
                source_type="vip_question_answer",
                source_id=answer.id,
                points=points,
            )
            user = db.get(User, answer.user_id)
            if user is not None:
                check_points_achievements(db, user)


def award_points_once(db: Session, user_id: int, source_type: str, source_id: int, points: int) -> None:
    existing = db.scalar(
        select(PointsLog).where(
            PointsLog.user_id == user_id,
            PointsLog.source_type == source_type,
            PointsLog.source_id == source_id,
        )
    )
    if existing is not None:
        return

    if points != 0:
        user = db.get(User, user_id)
        if user is not None:
            user.points_total += points

    db.add(
        PointsLog(
            user_id=user_id,
            source_type=source_type,
            source_id=source_id,
            points=points,
        )
    )
