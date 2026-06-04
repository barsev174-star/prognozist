from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.referral import ReferralStats
from app.services.referrals import (
    REFERRAL_REWARDS,
    get_activated_referrals_count,
    get_referral_points,
    get_registered_referrals_count,
)

router = APIRouter(prefix="/referrals", tags=["Referrals"])


@router.get("/me", response_model=ReferralStats)
def get_my_referrals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReferralStats:
    activated_count = get_activated_referrals_count(db, current_user.id)
    next_threshold = next((threshold for threshold in sorted(REFERRAL_REWARDS) if activated_count < threshold), None)

    return ReferralStats(
        referral_link=f"{settings.telegram_webapp_url}?startapp=ref_{current_user.telegram_id}",
        registered_count=get_registered_referrals_count(db, current_user.id),
        activated_count=activated_count,
        referral_points=get_referral_points(db, current_user.id),
        next_reward_at=next_threshold,
        next_reward_points=REFERRAL_REWARDS[next_threshold] if next_threshold is not None else None,
    )

