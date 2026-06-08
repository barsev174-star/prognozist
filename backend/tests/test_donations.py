from collections.abc import Callable

from fastapi import HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1 import payments
from app.core.config import settings
from app.models import Donation, User
from app.schemas.donation import DonationPaymentConfirmRequest
from app.services.donations import DonationCreateResult, create_donation


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    User.metadata.create_all(engine, tables=[User.__table__, Donation.__table__])
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def create_user(db: Session, telegram_id: int = 1321200291) -> User:
    user = User(telegram_id=telegram_id, username="tester", first_name="Tester")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_create_donation_is_idempotent() -> None:
    db = create_test_session()
    user = create_user(db)

    first_result = create_donation(
        db=db,
        user=user,
        telegram_payment_charge_id="charge-1",
        stars_amount=100,
    )
    db.commit()

    second_result = create_donation(
        db=db,
        user=user,
        telegram_payment_charge_id="charge-1",
        stars_amount=100,
    )

    donations = list(db.scalars(select(Donation)))

    assert first_result.was_created is True
    assert second_result.was_created is False
    assert first_result.donation.id == second_result.donation.id
    assert len(donations) == 1
    assert donations[0].stars_amount == 100


class FakeSession:
    def __init__(self, user: User | None) -> None:
        self.user = user
        self.added: list[object] = []
        self.commit_calls = 0

    def scalar(self, _query: object) -> User | None:
        return self.user

    def add(self, obj: object) -> None:
        self.added.append(obj)

    def commit(self) -> None:
        self.commit_calls += 1


def test_confirm_donation_payment_logs_new_payment(monkeypatch) -> None:
    user = User(id=1, telegram_id=99, username="tester", first_name="Tester")
    db = FakeSession(user=user)
    donation = Donation(id=7, user_id=1, telegram_payment_charge_id="charge-1", stars_amount=250)

    def fake_create_donation(**_kwargs: object) -> DonationCreateResult:
        return DonationCreateResult(donation=donation, was_created=True)

    monkeypatch.setattr(payments, "create_donation", fake_create_donation)

    response = payments.confirm_donation_payment(
        payload=DonationPaymentConfirmRequest(
            telegram_id=99,
            telegram_payment_charge_id="charge-1",
            stars_amount=250,
        ),
        x_bot_internal_token=settings.bot_internal_token,
        db=db,  # type: ignore[arg-type]
    )

    assert response.donation_id == 7
    assert response.was_created is True
    assert db.commit_calls == 1
    assert len(db.added) == 1
    log = db.added[0]
    assert getattr(log, "event_type") == "donation_paid"
    assert getattr(log, "payload_json") == {
        "donation_id": 7,
        "stars_amount": 250,
        "telegram_payment_charge_id": "charge-1",
    }


def test_confirm_donation_payment_does_not_duplicate_log_on_replay(monkeypatch) -> None:
    user = User(id=1, telegram_id=99, username="tester", first_name="Tester")
    db = FakeSession(user=user)
    donation = Donation(id=7, user_id=1, telegram_payment_charge_id="charge-1", stars_amount=250)

    def fake_create_donation(**_kwargs: object) -> DonationCreateResult:
        return DonationCreateResult(donation=donation, was_created=False)

    monkeypatch.setattr(payments, "create_donation", fake_create_donation)

    response = payments.confirm_donation_payment(
        payload=DonationPaymentConfirmRequest(
            telegram_id=99,
            telegram_payment_charge_id="charge-1",
            stars_amount=250,
        ),
        x_bot_internal_token=settings.bot_internal_token,
        db=db,  # type: ignore[arg-type]
    )

    assert response.donation_id == 7
    assert response.was_created is False
    assert db.commit_calls == 1
    assert db.added == []


def test_confirm_donation_payment_rejects_invalid_bot_token(monkeypatch) -> None:
    db = FakeSession(user=User(id=1, telegram_id=99, username="tester", first_name="Tester"))
    called = {"value": False}

    def fake_create_donation(**_kwargs: object) -> DonationCreateResult:
        called["value"] = True
        raise AssertionError("create_donation should not be called")

    monkeypatch.setattr(payments, "create_donation", fake_create_donation)

    try:
        payments.confirm_donation_payment(
            payload=DonationPaymentConfirmRequest(
                telegram_id=99,
                telegram_payment_charge_id="charge-1",
                stars_amount=250,
            ),
            x_bot_internal_token="wrong-token",
            db=db,  # type: ignore[arg-type]
        )
    except HTTPException as exc:
        assert exc.status_code == 403
        assert exc.detail == "Invalid bot token"
    else:
        raise AssertionError("Expected HTTPException for invalid bot token")

    assert called["value"] is False
