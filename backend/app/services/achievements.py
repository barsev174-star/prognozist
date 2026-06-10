from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Achievement, Prediction, TournamentResult, User, UserAchievement

FIRST_PREDICTION = "first_prediction"
FIRST_EXACT_SCORE = "first_exact_score"
TEN_EXACT_SCORES = "ten_exact_scores"
HUNDRED_POINTS = "hundred_points"
TOURNAMENT_TOP_10 = "tournament_top_10"
TOURNAMENT_CHAMPION = "tournament_champion"
FIFTY_INVITED_FRIENDS = "fifty_invited_friends"


def award_achievement(db: Session, user_id: int, code: str) -> bool:
    achievement = db.scalar(select(Achievement).where(Achievement.code == code))
    if achievement is None:
        return False

    for pending in db.new:
        if isinstance(pending, UserAchievement) and pending.user_id == user_id and pending.achievement_id == achievement.id:
            return False

    existing = db.scalar(
        select(UserAchievement).where(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement.id,
        )
    )
    if existing is not None:
        return False

    db.add(UserAchievement(user_id=user_id, achievement_id=achievement.id))
    return True


def check_points_achievements(db: Session, user: User) -> None:
    if user.points_total >= 100:
        award_achievement(db, user.id, HUNDRED_POINTS)


def check_prediction_achievements(db: Session, user_id: int) -> None:
    predictions_count = db.scalar(select(func.count()).select_from(Prediction).where(Prediction.user_id == user_id)) or 0
    if predictions_count >= 1:
        award_achievement(db, user_id, FIRST_PREDICTION)

    exact_scores_count = db.scalar(
        select(func.count()).select_from(Prediction).where(
            Prediction.user_id == user_id,
            Prediction.is_exact_score.is_(True),
        )
    ) or 0
    if exact_scores_count >= 1:
        award_achievement(db, user_id, FIRST_EXACT_SCORE)
    if exact_scores_count >= 10:
        award_achievement(db, user_id, TEN_EXACT_SCORES)


def check_tournament_result_achievements(db: Session, tournament_id: int) -> None:
    results = db.scalars(select(TournamentResult).where(TournamentResult.tournament_id == tournament_id)).all()
    for result in results:
        if result.final_rank <= 10:
            award_achievement(db, result.user_id, TOURNAMENT_TOP_10)
        if result.final_rank == 1:
            award_achievement(db, result.user_id, TOURNAMENT_CHAMPION)

