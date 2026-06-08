from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1.leagues import create_league
from app.api.v1.tournaments import list_public_tournaments, list_tournament_prediction_questions
from app.models import (
    League,
    LeagueMember,
    Season,
    SeasonStatus,
    Team,
    TeamConfederation,
    TeamStatus,
    Tournament,
    TournamentPredictionOption,
    TournamentPredictionOptionType,
    TournamentPredictionQuestion,
    TournamentPredictionQuestionStatus,
    TournamentStatus,
    User,
)
from app.schemas.league import DEFAULT_PRIZE_DESCRIPTION, LeagueCreate


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
            Team.__table__,
            TournamentPredictionQuestion.__table__,
            TournamentPredictionOption.__table__,
        ],
    )
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def create_user(db: Session, telegram_id: int = 1001) -> User:
    user = User(telegram_id=telegram_id, username="tester", first_name="Tester")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_tournament(db: Session, status: TournamentStatus = TournamentStatus.active) -> Tournament:
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
        name=f"Tournament {status.value}",
        description=None,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 7, 31),
        status=status,
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


def test_create_league_uses_tbd_prize_by_default() -> None:
    db = create_test_session()
    user = create_user(db)
    tournament = create_tournament(db)

    league = create_league(
        payload=LeagueCreate(
            tournament_id=tournament.id,
            name="Friends League",
            description="Private standings",
            prize_description=None,
        ),
        db=db,
        current_user=user,
    )

    assert league.prize_description == DEFAULT_PRIZE_DESCRIPTION


def test_list_public_tournaments_skips_completed() -> None:
    db = create_test_session()
    create_tournament(db, status=TournamentStatus.completed)
    upcoming = create_tournament(db, status=TournamentStatus.upcoming)
    active = create_tournament(db, status=TournamentStatus.active)

    tournaments = list_public_tournaments(db=db)

    assert [item.id for item in tournaments] == [upcoming.id, active.id]


def test_public_tournament_prediction_questions_hide_drafts() -> None:
    db = create_test_session()
    tournament = create_tournament(db)
    team = Team(
        slug="argentina",
        name="Argentina",
        fifa_code="ARG",
        confederation=TeamConfederation.conmebol,
        status=TeamStatus.active,
    )
    db.add(team)
    db.flush()

    draft_question = TournamentPredictionQuestion(
        tournament_id=tournament.id,
        code="winner-draft",
        title="Draft winner",
        option_type=TournamentPredictionOptionType.team,
        status=TournamentPredictionQuestionStatus.draft,
        points=15,
    )
    active_question = TournamentPredictionQuestion(
        tournament_id=tournament.id,
        code="winner",
        title="Tournament winner",
        option_type=TournamentPredictionOptionType.team,
        status=TournamentPredictionQuestionStatus.active,
        points=15,
    )
    db.add(draft_question)
    db.add(active_question)
    db.flush()
    db.add(
        TournamentPredictionOption(
            question_id=active_question.id,
            team_id=team.id,
            label="Argentina",
            sort_order=1,
        )
    )
    db.commit()

    questions = list_tournament_prediction_questions(tournament_id=tournament.id, db=db)

    assert [question.code for question in questions] == ["winner"]
    assert questions[0].options[0].label == "Argentina"
