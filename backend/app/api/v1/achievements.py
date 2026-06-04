from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Achievement, User, UserAchievement
from app.schemas.achievement import AchievementItem, AchievementShareResponse

router = APIRouter(prefix="/achievements", tags=["Achievements"])


@router.get("/me", response_model=list[AchievementItem])
def list_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AchievementItem]:
    achievements = db.scalars(select(Achievement).order_by(Achievement.id.asc())).all()
    earned = {
        item.achievement_id: item
        for item in db.scalars(select(UserAchievement).where(UserAchievement.user_id == current_user.id)).all()
    }

    return [
        AchievementItem(
            id=achievement.id,
            code=achievement.code,
            name=achievement.name,
            description=achievement.description,
            share_template=achievement.share_template,
            earned_at=earned[achievement.id].earned_at if achievement.id in earned else None,
            share_card_url=earned[achievement.id].share_card_url if achievement.id in earned else None,
            is_earned=achievement.id in earned,
        )
        for achievement in achievements
    ]


@router.post("/{achievement_id}/share-card", response_model=AchievementShareResponse)
def create_achievement_share_card(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AchievementShareResponse:
    achievement = db.get(Achievement, achievement_id)
    if achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")

    user_achievement = db.get(
        UserAchievement,
        {"user_id": current_user.id, "achievement_id": achievement.id},
    )
    if user_achievement is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Achievement is not earned")

    return AchievementShareResponse(
        text=achievement.share_template or achievement.name,
        share_card_url=user_achievement.share_card_url,
    )

