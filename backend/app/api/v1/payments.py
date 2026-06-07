from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import SystemLog, User
from app.schemas.donation import DonationPaymentConfirmRequest, DonationPaymentConfirmResponse
from app.services.donations import create_donation

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/donations/confirm", response_model=DonationPaymentConfirmResponse)
def confirm_donation_payment(
    payload: DonationPaymentConfirmRequest,
    x_bot_internal_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> DonationPaymentConfirmResponse:
    if x_bot_internal_token != settings.bot_internal_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bot token")

    user = db.scalar(select(User).where(User.telegram_id == payload.telegram_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = create_donation(
        db=db,
        user=user,
        telegram_payment_charge_id=payload.telegram_payment_charge_id,
        stars_amount=payload.stars_amount,
    )
    if result.was_created:
        db.add(
            SystemLog(
                event_type="donation_paid",
                user_id=user.id,
                payload_json={
                    "donation_id": result.donation.id,
                    "stars_amount": result.donation.stars_amount,
                    "telegram_payment_charge_id": result.donation.telegram_payment_charge_id,
                },
            )
        )
    db.commit()

    return DonationPaymentConfirmResponse(
        donation_id=result.donation.id,
        was_created=result.was_created,
    )
