from datetime import UTC, date, datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import (
    League,
    LeagueMember,
    Match,
    PointsLog,
    Prediction,
    Question,
    QuestionAnswer,
    Season,
    SeasonStatus,
    Tournament,
    TournamentStatus,
    User,
    VipQuestion,
    VipQuestionAnswer,
)
from app.services.rankings import build_league_ranking


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
            Season.__table__,
            Tournament.__table__,
            League.__table__,
            LeagueMember.__table__,
            Match.__table__,
            Prediction.__table__,
            Question.__table__,
            QuestionAnswer.__table__,
            VipQuestion.__table__,
            VipQuestionAnswer.__table__,
            PointsLog.__table__,
        ],
    )
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def create_tournament(db: Session) -> Tournament:
    season = Season(
        name="Season 2026",
        description=None,
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
        status=SeasonStatus.active,
    )
    db.add(season)
    db.flush()

    tournament = Tournament(
        season_id=season.id,
        name="League Tournament",
        description=None,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 7, 31),
        status=TournamentStatus.active,
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


def create_user(db: Session, telegram_id: int, first_name: str) -> User:
    user = User(telegram_id=telegram_id, username=first_name.lower(), first_name=first_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_league_with_members(db: Session, tournament_id: int, users: list[User]) -> League:
    league = League(
        owner_id=users[0].id,
        tournament_id=tournament_id,
        name="Friends League",
        description=None,
        prize_description="Cup",
        invite_code="league-code",
    )
    db.add(league)
    db.flush()

    for user in users:
        db.add(
            LeagueMember(
                league_id=league.id,
                user_id=user.id,
                joined_at=datetime.now(UTC),
            )
        )

    db.commit()
    db.refresh(league)
    return league


def test_league_ranking_includes_members_without_points() -> None:
    db = create_test_session()
    tournament = create_tournament(db)
    current_user = create_user(db, 1001, "Anna")
    second_user = create_user(db, 1002, "Boris")
    league = create_league_with_members(db, tournament.id, [current_user, second_user])

    ranking = build_league_ranking(db, league.id, current_user, limit=50)

    assert [entry.user_id for entry in ranking.entries] == [current_user.id, second_user.id]
    assert [entry.points for entry in ranking.entries] == [0, 0]
    assert ranking.current_user_entry is not None
    assert ranking.current_user_entry.user_id == current_user.id


def test_league_ranking_keeps_zero_point_members_after_scored_entries() -> None:
    db = create_test_session()
    tournament = create_tournament(db)
    current_user = create_user(db, 2001, "Artem")
    leader = create_user(db, 2002, "Daria")
    league = create_league_with_members(db, tournament.id, [current_user, leader])

    match = Match(
        tournament_id=tournament.id,
        team_1="Argentina",
        team_2="Brazil",
        team_1_logo=None,
        team_2_logo=None,
        start_time=datetime.now(UTC) + timedelta(days=1),
    )
    db.add(match)
    db.flush()

    prediction = Prediction(
        user_id=leader.id,
        match_id=match.id,
        predicted_team_1_score=2,
        predicted_team_2_score=1,
    )
    db.add(prediction)
    db.flush()

    db.add(
        PointsLog(
            user_id=leader.id,
            source_type="score_prediction",
            source_id=prediction.id,
            points=7,
        )
    )
    db.commit()

    ranking = build_league_ranking(db, league.id, current_user, limit=50)

    assert [entry.user_id for entry in ranking.entries] == [leader.id, current_user.id]
    assert [entry.points for entry in ranking.entries] == [7, 0]
    assert ranking.current_user_entry is not None
    assert ranking.current_user_entry.rank == 2
