from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Donation, User


@dataclass(frozen=True)
class DonationCreateResult:
    donation: Donation
    was_created: bool


def create_donation(
    db: Session,
    user: User,
    telegram_payment_charge_id: str,
    stars_amount: int,
) -> DonationCreateResult:
    existing = db.scalar(select(Donation).where(Donation.telegram_payment_charge_id == telegram_payment_charge_id))
    if existing is not None:
        return DonationCreateResult(donation=existing, was_created=False)

    donation = Donation(
        user_id=user.id,
        telegram_payment_charge_id=telegram_payment_charge_id,
        stars_amount=stars_amount,
    )
    db.add(donation)
    db.flush()
    return DonationCreateResult(donation=donation, was_created=True)
