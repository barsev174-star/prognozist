from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import (
    ExpertPrediction,
    Match,
    MatchStatus,
    Prediction,
    Question,
    QuestionAnswer,
    Tournament,
    User,
    VipQuestion,
    VipQuestionAnswer,
)
from app.models.expert import ExpertPostPublishSource
from app.services import scoring
from app.services import autoposting_clean as autoposting


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
            Tournament.__table__,
            Match.__table__,
            Prediction.__table__,
            Question.__table__,
            QuestionAnswer.__table__,
            VipQuestion.__table__,
            VipQuestionAnswer.__table__,
            ExpertPrediction.__table__,
        ],
    )
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def create_match_bundle(db: Session, *, started: bool, telegram_id: int) -> ExpertPrediction:
    user = User(telegram_id=telegram_id, username=f"expert_{telegram_id}", first_name="Expert")
    tournament = Tournament(
        season_id=1,
        name="World Cup",
        start_date=datetime(2026, 6, 1, tzinfo=UTC),
        end_date=datetime(2026, 7, 1, tzinfo=UTC),
        status="active",
    )
    match = Match(
        tournament_id=1,
        team_1="A",
        team_2="B",
        team_1_logo=None,
        team_2_logo=None,
        start_time=datetime.now(UTC) - timedelta(minutes=5) if started else datetime.now(UTC) + timedelta(minutes=5),
        status=MatchStatus.upcoming,
    )
    db.add(user)
    db.add(tournament)
    db.flush()
    match.tournament_id = tournament.id
    db.add(match)
    db.flush()
    db.add(Question(match_id=match.id, slot=1, text="Q1", points=1))
    db.add(VipQuestion(match_id=match.id, text="VIP", points=2))
    expert = ExpertPrediction(
        match_id=match.id,
        expert_user_id=user.id,
        predicted_team_1_score=1,
        predicted_team_2_score=0,
        question_answer=True,
        question_2_answer=None,
        vip_question_answer=False,
    )
    db.add(expert)
    db.commit()
    db.refresh(expert)
    return expert


def test_publish_due_expert_predictions_only_publishes_started_matches(monkeypatch) -> None:
    db = create_test_session()
    started_expert = create_match_bundle(db, started=True, telegram_id=1001)
    not_started_expert = create_match_bundle(db, started=False, telegram_id=1002)

    async def fake_publish_to_vip_channel(text: str) -> autoposting.VipChannelPublishResult:
        return autoposting.VipChannelPublishResult(ok=True, detail="Published")

    monkeypatch.setattr(autoposting, "publish_to_vip_channel", fake_publish_to_vip_channel)

    result = autoposting.publish_due_expert_predictions(db)
    db.commit()
    db.refresh(started_expert)
    db.refresh(not_started_expert)

    assert result.checked == 1
    assert result.published == 1
    assert result.failed == 0
    assert started_expert.is_published is True
    assert started_expert.publish_source == ExpertPostPublishSource.automatic
    assert started_expert.published_at is not None
    assert not_started_expert.is_published is False


def test_manual_publish_marks_manual_source(monkeypatch) -> None:
    db = create_test_session()
    expert = create_match_bundle(db, started=False, telegram_id=1003)

    async def fake_publish_to_vip_channel(text: str) -> autoposting.VipChannelPublishResult:
        return autoposting.VipChannelPublishResult(ok=True, detail="Published")

    monkeypatch.setattr(autoposting, "publish_to_vip_channel", fake_publish_to_vip_channel)

    result = autoposting.publish_expert_prediction_post(db, expert, source=ExpertPostPublishSource.manual)
    db.commit()
    db.refresh(expert)

    assert result.ok is True
    assert expert.is_published is True
    assert expert.publish_source == ExpertPostPublishSource.manual
    assert expert.published_at is not None


def test_publish_due_expert_predictions_collects_failure_details(monkeypatch) -> None:
    db = create_test_session()
    expert = create_match_bundle(db, started=True, telegram_id=1004)

    async def fake_publish_to_vip_channel(text: str) -> autoposting.VipChannelPublishResult:
        return autoposting.VipChannelPublishResult(ok=False, detail="VIP channel is unavailable")

    monkeypatch.setattr(autoposting, "publish_to_vip_channel", fake_publish_to_vip_channel)

    result = autoposting.publish_due_expert_predictions(db)

    assert result.checked == 1
    assert result.published == 0
    assert result.failed == 1
    assert result.failed_items == [
        {
            "expert_prediction_id": expert.id,
            "match_id": expert.match_id,
            "detail": "VIP channel is unavailable",
            "start_time": expert.match.start_time.isoformat(),
        }
    ]


def test_format_match_result_post_includes_question_texts_percentages_and_simple_average() -> None:
    db = create_test_session()
    expert = create_match_bundle(db, started=True, telegram_id=1005)
    match = db.get(Match, expert.match_id)
    assert match is not None
    match.team_1 = "Ирак"
    match.team_2 = "Иордания"
    match.team_1_score = 1
    match.team_2_score = 1

    questions = db.query(Question).filter(Question.match_id == match.id).order_by(Question.slot.asc()).all()
    questions[0].text = "Обе команды забьют?"
    questions[0].correct_answer = True
    second_question = Question(match_id=match.id, slot=2, text="Будет пенальти?", points=1, correct_answer=False)
    db.add(second_question)
    vip_question = db.query(VipQuestion).filter(VipQuestion.match_id == match.id).one()
    vip_question.text = "Будет удаление?"
    vip_question.correct_answer = True

    player_one = User(telegram_id=2001, username="u1", first_name="One")
    player_two = User(telegram_id=2002, username="u2", first_name="Two")
    db.add_all([player_one, player_two])
    db.flush()

    db.add_all(
        [
            Prediction(user_id=player_one.id, match_id=match.id, predicted_team_1_score=1, predicted_team_2_score=2),
            Prediction(user_id=player_two.id, match_id=match.id, predicted_team_1_score=1, predicted_team_2_score=2),
            QuestionAnswer(user_id=player_one.id, question_id=questions[0].id, answer=True),
            QuestionAnswer(user_id=player_two.id, question_id=questions[0].id, answer=False),
            QuestionAnswer(user_id=player_one.id, question_id=second_question.id, answer=False),
            QuestionAnswer(user_id=player_two.id, question_id=second_question.id, answer=True),
            VipQuestionAnswer(user_id=player_one.id, vip_question_id=vip_question.id, answer=True),
            VipQuestionAnswer(user_id=player_two.id, vip_question_id=vip_question.id, answer=False),
        ]
    )
    db.flush()

    scoring.score_completed_match(db, match)
    db.commit()

    post = autoposting.format_match_result_post(db, match, expert)

    assert "Средний прогноз игроков: 1:2" in post
    assert "Вопрос 1: Обе команды забьют?" in post
    assert "Угадали: 1 из 2 (50%)" in post
    assert "Вопрос 2: Будет пенальти?" in post
    assert "VIP-вопрос: Будет удаление?" in post
