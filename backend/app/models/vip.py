import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class VipSubscriptionStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"


class VipSubscription(Base):
    __tablename__ = "vip_subscriptions"
    __table_args__ = (UniqueConstraint("telegram_payment_charge_id", name="uq_vip_subscriptions_charge_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    telegram_payment_charge_id: Mapped[str] = mapped_column(String(255), nullable=False)
    stars_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[VipSubscriptionStatus] = mapped_column(
        Enum(VipSubscriptionStatus, name="vip_subscription_status"),
        nullable=False,
        default=VipSubscriptionStatus.active,
        server_default=VipSubscriptionStatus.active.value,
    )
    invite_link: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship()
