from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1 import vip
from app.core.config import settings
from app.models import User, VipSubscription
from app.schemas.vip import VipPaymentConfirmRequest
from app.services.vip import activate_vip_subscription


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    User.metadata.create_all(engine, tables=[User.__table__, VipSubscription.__table__])
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def create_user(db: Session, telegram_id: int = 1321200291) -> User:
    user = User(telegram_id=telegram_id, username="vip_user", first_name="VIP User")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_activate_vip_subscription_is_idempotent() -> None:
    db = create_test_session()
    user = create_user(db)

    first_result = activate_vip_subscription(
        db=db,
        user=user,
        telegram_payment_charge_id="vip-charge-1",
        stars_amount=100,
        duration_days=30,
        invite_link="https://t.me/+vip",
    )
    db.commit()

    second_result = activate_vip_subscription(
        db=db,
        user=user,
        telegram_payment_charge_id="vip-charge-1",
        stars_amount=100,
        duration_days=30,
        invite_link="https://t.me/+vip",
    )

    subscriptions = list(db.scalars(select(VipSubscription)))

    assert first_result.was_created is True
    assert second_result.was_created is False
    assert first_result.subscription.id == second_result.subscription.id
    assert len(subscriptions) == 1
    assert user.premium_until is not None


def test_confirm_vip_payment_endpoint_reuses_existing_subscription() -> None:
    db = create_test_session()
    user = create_user(db, telegram_id=555)
    payload = VipPaymentConfirmRequest(
        telegram_id=555,
        telegram_payment_charge_id="vip-charge-2",
        stars_amount=100,
        duration_days=30,
        invite_link="https://t.me/+vip",
    )

    first_response = vip.confirm_vip_payment(
        payload=payload,
        x_bot_internal_token=settings.bot_internal_token,
        db=db,
    )
    second_response = vip.confirm_vip_payment(
        payload=payload,
        x_bot_internal_token=settings.bot_internal_token,
        db=db,
    )

    subscriptions = list(db.scalars(select(VipSubscription)))

    assert first_response.was_created is True
    assert second_response.was_created is False
    assert first_response.is_active is True
    assert second_response.is_active is True
    assert len(subscriptions) == 1


def test_get_vip_status_returns_latest_invite_link() -> None:
    db = create_test_session()
    user = create_user(db, telegram_id=777)
    activate_vip_subscription(
        db=db,
        user=user,
        telegram_payment_charge_id="vip-charge-3",
        stars_amount=100,
        duration_days=30,
        invite_link="https://t.me/+vip-latest",
    )
    db.commit()
    db.refresh(user)

    response = vip.get_vip_status(db=db, current_user=user)

    assert response.is_active is True
    assert response.invite_link == "https://t.me/+vip-latest"
