from pydantic import BaseModel, Field


class DonationPaymentConfirmRequest(BaseModel):
    telegram_id: int
    telegram_payment_charge_id: str = Field(min_length=1, max_length=255)
    stars_amount: int = Field(gt=0)


class DonationPaymentConfirmResponse(BaseModel):
    donation_id: int
    was_created: bool
