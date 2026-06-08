from datetime import datetime

from pydantic import BaseModel, Field


class VipStatusResponse(BaseModel):
    is_active: bool
    premium_until: datetime | None
    stars_amount: int
    duration_days: int
    invite_link: str | None = None
    channel_enabled: bool = False


class VipInvoiceResponse(BaseModel):
    title: str
    description: str
    payload: str
    currency: str
    stars_amount: int
    duration_days: int


class VipPaymentConfirmRequest(BaseModel):
    telegram_id: int
    telegram_payment_charge_id: str = Field(min_length=1, max_length=255)
    stars_amount: int = Field(gt=0)
    duration_days: int = Field(gt=0)
    invite_link: str | None = Field(default=None, max_length=1024)


class VipPaymentConfirmResponse(BaseModel):
    is_active: bool
    premium_until: datetime | None
    was_created: bool

