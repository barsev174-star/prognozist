from datetime import UTC, date, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1.leagues import create_league
from app.api.v1.tournaments import (
    create_or_update_tournament_prediction,
    list_my_tournament_prediction_questions,
    list_public_tournaments,
    list_tournament_prediction_questions,
)
from app.models.achievement import Achievement, UserAchievement
from app.models import (
    League,
    LeagueMember,
    PointsLog,
    Season,
    SeasonStatus,
    Team,
    TeamConfederation,
    TeamStatus,
    Tournament,
    TournamentPredictionOption,
    TournamentPredictionOptionType,
    TournamentPrediction,
    TournamentPredictionQuestion,
    TournamentPredictionQuestionStatus,
    TournamentPredictionResult,
    TournamentStatus,
    User,
)
from app.schemas.league import DEFAULT_PRIZE_DESCRIPTION, LeagueCreate
from app.schemas.tournament_prediction import TournamentPredictionAnswerCreate, TournamentPredictionResolve
from app.services.tournament_predictions import resolve_tournament_prediction_question


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
            PointsLog.__table__,
            Achievement.__table__,
            UserAchievement.__table__,
            Team.__table__,
            TournamentPredictionQuestion.__table__,
            TournamentPredictionOption.__table__,
            TournamentPrediction.__table__,
            TournamentPredictionResult.__table__,
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


def test_user_can_save_and_load_tournament_prediction() -> None:
    db = create_test_session()
    user = create_user(db)
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

    question = TournamentPredictionQuestion(
        tournament_id=tournament.id,
        code="winner",
        title="Tournament winner",
        option_type=TournamentPredictionOptionType.team,
        status=TournamentPredictionQuestionStatus.active,
        points=15,
        lock_at=datetime.now(UTC) + timedelta(days=3),
    )
    db.add(question)
    db.flush()
    option = TournamentPredictionOption(
        question_id=question.id,
        team_id=team.id,
        label="Argentina",
        sort_order=1,
    )
    db.add(option)
    db.commit()

    prediction = create_or_update_tournament_prediction(
        question_id=question.id,
        payload=TournamentPredictionAnswerCreate(selected_option_id=option.id),
        db=db,
        current_user=user,
    )

    assert prediction.selected_option_id == option.id

    questions = list_my_tournament_prediction_questions(tournament_id=tournament.id, db=db, current_user=user)

    assert len(questions) == 1
    assert questions[0].user_prediction is not None
    assert questions[0].user_prediction.selected_option_id == option.id


def test_locked_tournament_prediction_rejects_answers() -> None:
    db = create_test_session()
    user = create_user(db)
    tournament = create_tournament(db)
    question = TournamentPredictionQuestion(
        tournament_id=tournament.id,
        code="winner",
        title="Tournament winner",
        option_type=TournamentPredictionOptionType.custom,
        status=TournamentPredictionQuestionStatus.active,
        points=15,
        lock_at=datetime.now(UTC) - timedelta(minutes=1),
    )
    db.add(question)
    db.commit()

    try:
        create_or_update_tournament_prediction(
            question_id=question.id,
            payload=TournamentPredictionAnswerCreate(free_text="Argentina"),
            db=db,
            current_user=user,
        )
    except HTTPException as exc:
        assert exc.status_code == 409
        assert exc.detail == "Question is locked"
    else:
        raise AssertionError("Expected locked tournament prediction to raise HTTPException")


def test_resolve_tournament_prediction_awards_points_once() -> None:
    db = create_test_session()
    user = create_user(db)
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

    question = TournamentPredictionQuestion(
        tournament_id=tournament.id,
        code="winner",
        title="Tournament winner",
        option_type=TournamentPredictionOptionType.team,
        status=TournamentPredictionQuestionStatus.locked,
        points=15,
    )
    db.add(question)
    db.flush()
    option = TournamentPredictionOption(
        question_id=question.id,
        team_id=team.id,
        label="Argentina",
        sort_order=1,
    )
    db.add(option)
    db.flush()
    prediction = TournamentPrediction(
        question_id=question.id,
        user_id=user.id,
        selected_option_id=option.id,
    )
    db.add(prediction)
    db.commit()

    resolve_tournament_prediction_question(
        db=db,
        question=question,
        payload=TournamentPredictionResolve(correct_option_id=option.id),
        resolved_by_user_id=user.id,
    )
    db.commit()
    db.refresh(question)
    db.refresh(prediction)
    db.refresh(user)

    assert question.status == TournamentPredictionQuestionStatus.resolved
    assert prediction.points_awarded == 15
    assert user.points_total == 15
    assert db.scalar(select(PointsLog).where(PointsLog.user_id == user.id, PointsLog.source_type == "tournament_prediction")) is not None

    try:
        resolve_tournament_prediction_question(
            db=db,
            question=question,
            payload=TournamentPredictionResolve(correct_option_id=option.id),
            resolved_by_user_id=user.id,
        )
    except HTTPException as exc:
        assert exc.status_code == 409
        assert exc.detail == "Question is already resolved"
    else:
        raise AssertionError("Expected resolved tournament prediction question to reject second resolve")
