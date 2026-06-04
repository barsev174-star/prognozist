from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import PointsLog, Referral, ReferralStatus, User
from app.services.achievements import FIFTY_INVITED_FRIENDS, award_achievement
from app.services.scoring import award_points_once

REFERRAL_REWARDS = {
    5: 20,
    10: 50,
    25: 100,
}


def register_referral(db: Session, referrer_telegram_id: int | None, referred_user: User) -> None:
    if referrer_telegram_id is None:
        return
    if referrer_telegram_id == referred_user.telegram_id:
        return
    if db.scalar(select(Referral).where(Referral.referred_id == referred_user.id)) is not None:
        return

    referrer = db.scalar(select(User).where(User.telegram_id == referrer_telegram_id))
    if referrer is None:
        return

    db.add(Referral(referrer_id=referrer.id, referred_id=referred_user.id))


def parse_referrer_telegram_id(start_param: str | None) -> int | None:
    if not start_param:
        return None

    raw_value = start_param
    if start_param.startswith("ref_"):
        raw_value = start_param.removeprefix("ref_")

    try:
        return int(raw_value)
    except ValueError:
        return None


def activate_referral_after_first_prediction(db: Session, referred_user: User) -> None:
    referral = db.scalar(
        select(Referral).where(
            Referral.referred_id == referred_user.id,
            Referral.status == ReferralStatus.registered,
        )
    )
    if referral is None:
        return

    referral.status = ReferralStatus.activated
    referral.activated_at = datetime.now(UTC)
    apply_referral_rewards(db, referral.referrer_id)


def apply_referral_rewards(db: Session, referrer_id: int) -> None:
    activated_count = get_activated_referrals_count(db, referrer_id)

    for threshold, points in REFERRAL_REWARDS.items():
        if activated_count >= threshold:
            award_points_once(
                db=db,
                user_id=referrer_id,
                source_type="referral_reward",
                source_id=threshold,
                points=points,
            )

    if activated_count >= 50:
        award_achievement(db, referrer_id, FIFTY_INVITED_FRIENDS)


def get_activated_referrals_count(db: Session, user_id: int) -> int:
    return db.scalar(
        select(func.count()).select_from(Referral).where(
            Referral.referrer_id == user_id,
            Referral.status == ReferralStatus.activated,
        )
    ) or 0


def get_registered_referrals_count(db: Session, user_id: int) -> int:
    return db.scalar(select(func.count()).select_from(Referral).where(Referral.referrer_id == user_id)) or 0


def get_referral_points(db: Session, user_id: int) -> int:
    return db.scalar(
        select(func.coalesce(func.sum(PointsLog.points), 0)).where(
            PointsLog.user_id == user_id,
            PointsLog.source_type == "referral_reward",
        )
    ) or 0

