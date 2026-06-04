from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, VipSubscription, VipSubscriptionStatus


@dataclass(frozen=True)
class VipActivationResult:
    subscription: VipSubscription
    was_created: bool


def has_active_vip(user: User) -> bool:
    return user.premium_until is not None and user.premium_until > datetime.now(UTC)


def activate_vip_subscription(
    db: Session,
    user: User,
    telegram_payment_charge_id: str,
    stars_amount: int,
    duration_days: int,
    invite_link: str | None = None,
) -> VipActivationResult:
    existing = db.scalar(
        select(VipSubscription).where(
            VipSubscription.telegram_payment_charge_id == telegram_payment_charge_id,
        )
    )
    if existing is not None:
        return VipActivationResult(subscription=existing, was_created=False)

    now = datetime.now(UTC)
    starts_at = user.premium_until if user.premium_until and user.premium_until > now else now
    expires_at = starts_at + timedelta(days=duration_days)

    subscription = VipSubscription(
        user_id=user.id,
        telegram_payment_charge_id=telegram_payment_charge_id,
        stars_amount=stars_amount,
        duration_days=duration_days,
        started_at=starts_at,
        expires_at=expires_at,
        status=VipSubscriptionStatus.active,
        invite_link=invite_link,
    )
    user.premium_until = expires_at
    db.add(subscription)
    return VipActivationResult(subscription=subscription, was_created=True)

