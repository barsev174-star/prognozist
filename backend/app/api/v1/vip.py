from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.vip import (
    VipInvoiceResponse,
    VipPaymentConfirmRequest,
    VipPaymentConfirmResponse,
    VipStatusResponse,
)
from app.services.vip import activate_vip_subscription, has_active_vip

router = APIRouter(prefix="/vip", tags=["VIP"])


@router.get("/status", response_model=VipStatusResponse)
def get_vip_status(current_user: User = Depends(get_current_user)) -> VipStatusResponse:
    return VipStatusResponse(
        is_active=has_active_vip(current_user),
        premium_until=current_user.premium_until,
        stars_amount=settings.vip_stars_amount,
        duration_days=settings.vip_default_duration_days,
    )


@router.post("/invoice", response_model=VipInvoiceResponse)
def get_vip_invoice_payload(current_user: User = Depends(get_current_user)) -> VipInvoiceResponse:
    return VipInvoiceResponse(
        title="VIP подписка",
        description=f"VIP доступ на {settings.vip_default_duration_days} дней",
        payload=f"vip:{current_user.telegram_id}",
        currency="XTR",
        stars_amount=settings.vip_stars_amount,
        duration_days=settings.vip_default_duration_days,
    )


@router.post("/payment/confirm", response_model=VipPaymentConfirmResponse)
def confirm_vip_payment(
    payload: VipPaymentConfirmRequest,
    x_bot_internal_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> VipPaymentConfirmResponse:
    if x_bot_internal_token != settings.bot_internal_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bot token")

    user = db.scalar(select(User).where(User.telegram_id == payload.telegram_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = activate_vip_subscription(
        db=db,
        user=user,
        telegram_payment_charge_id=payload.telegram_payment_charge_id,
        stars_amount=payload.stars_amount,
        duration_days=payload.duration_days,
        invite_link=payload.invite_link,
    )
    db.commit()
    db.refresh(user)

    return VipPaymentConfirmResponse(
        is_active=has_active_vip(user),
        premium_until=user.premium_until,
        was_created=result.was_created,
    )

