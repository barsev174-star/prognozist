from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Achievement, User, UserAchievement
from app.services.achievements import HUNDRED_POINTS, award_achievement


def create_test_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    User.metadata.create_all(
        engine,
        tables=[
            User.__table__,
            Achievement.__table__,
            UserAchievement.__table__,
        ],
    )
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def test_award_achievement_ignores_duplicate_pending_insert() -> None:
    db = create_test_session()
    user = User(telegram_id=100, username="tester", first_name="Tester")
    achievement = Achievement(code=HUNDRED_POINTS, name="100 points")
    db.add_all([user, achievement])
    db.commit()

    first = award_achievement(db, user.id, HUNDRED_POINTS)
    second = award_achievement(db, user.id, HUNDRED_POINTS)
    db.commit()

    awarded = db.query(UserAchievement).all()
    assert first is True
    assert second is False
    assert len(awarded) == 1
