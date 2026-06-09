from datetime import datetime

from pydantic import BaseModel


class StarAmountRead(BaseModel):
    amount: int
    nanostar_amount: int | None = None


class AdminStarTransactionRead(BaseModel):
    id: str
    amount: int
    nanostar_amount: int | None = None
    is_refund: bool = False
    created_at: datetime
    partner_type: str
    transaction_type: str | None = None
    title: str


class AdminStarsSummaryRead(BaseModel):
    balance: StarAmountRead
    transactions: list[AdminStarTransactionRead]
    incoming_total: int
    outgoing_total: int
