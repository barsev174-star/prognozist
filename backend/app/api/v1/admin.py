import asyncio
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
import sqlalchemy as sa
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_admin
from app.db.session import get_db
from app.models import ExpertPrediction, League, Match, MatchStatus, PointsLog, Question, Season, SystemLog, Tournament, User, VipQuestion
from app.schemas.expert import ExpertPredictionCreate, ExpertPredictionRead, ExpertPredictionUpdate
from app.schemas.log import AdminPointsLogRead, AdminSystemLogRead
from app.schemas.match import MatchCreate, MatchQuestionsRead, MatchRead, MatchResultUpdate, MatchUpdate
from app.schemas.question import QuestionCreate, QuestionRead, QuestionUpdate
from app.schemas.season import SeasonCreate, SeasonRead, SeasonUpdate
from app.schemas.tournament import (
    TournamentCompletionReadinessRead,
    TournamentCompletionResultRead,
    TournamentCreate,
    TournamentRead,
    TournamentUpdate,
)
from app.schemas.user import UserAdminUpdate, UserGrantVipRequest, UserProfile
from app.services.autoposting import (
    format_expert_prediction_post,
    format_league_result_post,
    format_match_result_post,
    format_tournament_result_post,
    publish_to_vip_channel,
)
from app.services.scoring import score_completed_match
from app.services.tournaments import complete_tournament, get_completion_readiness
from app.services.vip import activate_vip_subscription

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


def ensure_date_range(start_date, end_date) -> None:
    if start_date > end_date:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Start date must be before end date")


def add_system_log(db: Session, event_type: str, user: User | None = None, payload: dict | None = None) -> None:
    db.add(SystemLog(event_type=event_type, user_id=user.id if user else None, payload_json=payload))


@router.get("/me", response_model=UserProfile)
def get_admin_me(current_admin: User = Depends(get_current_admin)) -> User:
    return current_admin


@router.get("/users", response_model=list[UserProfile])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc(), User.id.desc())))


@router.get("/logs/system", response_model=list[AdminSystemLogRead])
def list_system_logs(limit: int = 100, db: Session = Depends(get_db)) -> list[AdminSystemLogRead]:
    safe_limit = min(max(limit, 1), 500)
    logs = list(db.scalars(select(SystemLog).order_by(SystemLog.created_at.desc(), SystemLog.id.desc()).limit(safe_limit)))
    return [
        AdminSystemLogRead(
            id=log.id,
            event_type=log.event_type,
            user_id=log.user_id,
            telegram_id=log.user.telegram_id if log.user else None,
            username=log.user.username if log.user else None,
            first_name=log.user.first_name if log.user else None,
            payload_json=log.payload_json,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.get("/logs/points", response_model=list[AdminPointsLogRead])
def list_points_logs(limit: int = 100, db: Session = Depends(get_db)) -> list[AdminPointsLogRead]:
    safe_limit = min(max(limit, 1), 500)
    logs = list(db.scalars(select(PointsLog).order_by(PointsLog.created_at.desc(), PointsLog.id.desc()).limit(safe_limit)))
    return [
        AdminPointsLogRead(
            id=log.id,
            user_id=log.user_id,
            telegram_id=log.user.telegram_id if log.user else None,
            username=log.user.username if log.user else None,
            first_name=log.user.first_name if log.user else None,
            source_type=log.source_type,
            source_id=log.source_id,
            points=log.points,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.patch("/users/{user_id}", response_model=UserProfile)
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    if user.id == current_admin.id and data.get("is_blocked") is True:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin cannot block themselves")

    for field, value in data.items():
        setattr(user, field, value)

    log_changes = {key: value.isoformat() if isinstance(value, datetime) else value for key, value in data.items()}
    add_system_log(
        db,
        "admin_user_updated",
        user=current_admin,
        payload={"target_user_id": user.id, "changes": log_changes},
    )
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/grant-vip", response_model=UserProfile)
def grant_user_vip(
    user_id: int,
    payload: UserGrantVipRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    activate_vip_subscription(
        db,
        user,
        telegram_payment_charge_id=f"admin:{user.id}:{datetime.now(UTC).isoformat()}",
        stars_amount=0,
        duration_days=payload.duration_days,
    )
    add_system_log(
        db,
        "admin_vip_granted",
        user=current_admin,
        payload={"target_user_id": user.id, "duration_days": payload.duration_days},
    )
    db.commit()
    db.refresh(user)
    return user


@router.post("/seasons", response_model=SeasonRead, status_code=status.HTTP_201_CREATED)
def create_season(payload: SeasonCreate, db: Session = Depends(get_db)) -> Season:
    ensure_date_range(payload.start_date, payload.end_date)
    season = Season(**payload.model_dump())
    db.add(season)
    db.commit()
    db.refresh(season)
    return season


@router.get("/seasons", response_model=list[SeasonRead])
def list_seasons(db: Session = Depends(get_db)) -> list[Season]:
    return list(db.scalars(select(Season).order_by(Season.start_date.desc(), Season.id.desc())))


@router.patch("/seasons/{season_id}", response_model=SeasonRead)
def update_season(season_id: int, payload: SeasonUpdate, db: Session = Depends(get_db)) -> Season:
    season = db.get(Season, season_id)
    if season is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")

    data = payload.model_dump(exclude_unset=True)
    start_date = data.get("start_date", season.start_date)
    end_date = data.get("end_date", season.end_date)
    ensure_date_range(start_date, end_date)

    for field, value in data.items():
        setattr(season, field, value)
    db.commit()
    db.refresh(season)
    return season


@router.post("/tournaments", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_tournament(payload: TournamentCreate, db: Session = Depends(get_db)) -> Tournament:
    ensure_date_range(payload.start_date, payload.end_date)
    if db.get(Season, payload.season_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")

    tournament = Tournament(**payload.model_dump())
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


@router.get("/tournaments", response_model=list[TournamentRead])
def list_tournaments(db: Session = Depends(get_db)) -> list[Tournament]:
    return list(db.scalars(select(Tournament).order_by(Tournament.start_date.desc(), Tournament.id.desc())))


@router.patch("/tournaments/{tournament_id}", response_model=TournamentRead)
def update_tournament(tournament_id: int, payload: TournamentUpdate, db: Session = Depends(get_db)) -> Tournament:
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    data = payload.model_dump(exclude_unset=True)
    if "season_id" in data and db.get(Season, data["season_id"]) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")

    start_date = data.get("start_date", tournament.start_date)
    end_date = data.get("end_date", tournament.end_date)
    ensure_date_range(start_date, end_date)

    for field, value in data.items():
        setattr(tournament, field, value)
    db.commit()
    db.refresh(tournament)
    return tournament


@router.get("/tournaments/{tournament_id}/completion-readiness", response_model=TournamentCompletionReadinessRead)
def get_tournament_completion_readiness(
    tournament_id: int,
    db: Session = Depends(get_db),
) -> TournamentCompletionReadinessRead:
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    readiness = get_completion_readiness(db, tournament.id)
    return TournamentCompletionReadinessRead(
        total_matches=readiness.total_matches,
        completed_matches=readiness.completed_matches,
        can_complete=readiness.can_complete,
    )


@router.post("/tournaments/{tournament_id}/complete", response_model=TournamentCompletionResultRead)
def complete_tournament_endpoint(
    tournament_id: int,
    db: Session = Depends(get_db),
) -> TournamentCompletionResultRead:
    tournament = db.get(Tournament, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    try:
        result = complete_tournament(db, tournament)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    db.commit()
    asyncio.run(publish_to_vip_channel(format_tournament_result_post(db, tournament.id)))
    for league_id in result.archived_league_ids:
        league = db.get(League, league_id)
        if league is not None:
            asyncio.run(publish_to_vip_channel(format_league_result_post(db, league)))
    return TournamentCompletionResultRead(
        tournament_id=result.tournament_id,
        tournament_results_created=result.tournament_results_created,
        leagues_archived=result.leagues_archived,
        league_results_created=result.league_results_created,
    )


@router.post("/matches", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_match(
    payload: MatchCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> Match:
    if db.get(Tournament, payload.tournament_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    match = Match(**payload.model_dump())
    db.add(match)
    db.flush()
    add_system_log(
        db,
        "admin_match_created",
        user=current_admin,
        payload={"match_id": match.id, "team_1": match.team_1, "team_2": match.team_2, "start_time": match.start_time.isoformat()},
    )
    db.commit()
    db.refresh(match)
    return match


@router.post("/expert-predictions", response_model=ExpertPredictionRead, status_code=status.HTTP_201_CREATED)
def create_expert_prediction(
    payload: ExpertPredictionCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> ExpertPrediction:
    if db.get(Match, payload.match_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    existing = db.scalar(select(ExpertPrediction).where(ExpertPrediction.match_id == payload.match_id))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Expert prediction already exists")

    expert = ExpertPrediction(**payload.model_dump(), expert_user_id=current_admin.id)
    db.add(expert)
    db.commit()
    db.refresh(expert)
    return expert


@router.get("/expert-predictions/{match_id}", response_model=ExpertPredictionRead)
def get_expert_prediction(
    match_id: int,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> ExpertPrediction:
    expert = db.scalar(select(ExpertPrediction).where(ExpertPrediction.match_id == match_id))
    if expert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert prediction not found")
    return expert


@router.patch("/expert-predictions/{expert_prediction_id}", response_model=ExpertPredictionRead)
def update_expert_prediction(
    expert_prediction_id: int,
    payload: ExpertPredictionUpdate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> ExpertPrediction:
    expert = db.get(ExpertPrediction, expert_prediction_id)
    if expert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert prediction not found")
    if expert.is_published:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Published expert prediction cannot be edited")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(expert, field, value)
    db.commit()
    db.refresh(expert)
    return expert


@router.post("/expert-predictions/{expert_prediction_id}/publish", response_model=ExpertPredictionRead)
def publish_expert_prediction(
    expert_prediction_id: int,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> ExpertPrediction:
    expert = db.get(ExpertPrediction, expert_prediction_id)
    if expert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert prediction not found")
    if expert.is_published:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Expert prediction is already published")

    match = db.get(Match, expert.match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    questions = list(db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc(), Question.id.asc())))
    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))
    asyncio.run(publish_to_vip_channel(format_expert_prediction_post(match, expert, questions, vip_question)))

    expert.is_published = True
    expert.published_at = datetime.now(UTC)
    db.commit()
    db.refresh(expert)
    return expert


@router.get("/matches", response_model=list[MatchRead])
def list_admin_matches(tournament_id: int | None = None, db: Session = Depends(get_db)) -> list[MatchRead]:
    query = select(Match).order_by(Match.start_time.asc(), Match.id.asc())
    if tournament_id is not None:
        query = query.where(Match.tournament_id == tournament_id)
    return [build_admin_match_read(match, db) for match in db.scalars(query)]


def build_admin_match_read(match: Match, db: Session) -> MatchRead:
    public_questions_count = db.scalar(
        select(sa.func.count()).select_from(Question).where(Question.match_id == match.id)
    ) or 0
    vip_question_exists = db.scalar(select(VipQuestion.id).where(VipQuestion.match_id == match.id)) is not None
    data = MatchRead.model_validate(match).model_dump()
    data.update(
        public_questions_count=public_questions_count,
        vip_question_exists=vip_question_exists,
        questions_complete=public_questions_count >= 2 and vip_question_exists,
    )
    return MatchRead(**data)


@router.patch("/matches/{match_id}", response_model=MatchRead)
def update_match(match_id: int, payload: MatchUpdate, db: Session = Depends(get_db)) -> Match:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    data = payload.model_dump(exclude_unset=True)
    if "tournament_id" in data and db.get(Tournament, data["tournament_id"]) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    for field, value in data.items():
        setattr(match, field, value)
    db.commit()
    db.refresh(match)
    return match


@router.get("/matches/{match_id}/questions", response_model=MatchQuestionsRead)
def get_admin_match_questions(match_id: int, db: Session = Depends(get_db)) -> MatchQuestionsRead:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    return MatchQuestionsRead(
        public_questions=list(db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc()))),
        public_question=db.scalar(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc())),
        vip_question=db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id)),
    )


@router.delete("/matches/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(match_id: int, db: Session = Depends(get_db)) -> None:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    db.delete(match)
    db.commit()


@router.post("/matches/{match_id}/result", response_model=MatchRead)
def enter_match_result(
    match_id: int,
    payload: MatchResultUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> Match:
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    if match.status == MatchStatus.completed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match is already completed")

    match.team_1_score = payload.team_1_score
    match.team_2_score = payload.team_2_score
    match.status = MatchStatus.calculating

    questions = list(db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc())))
    public_answers = payload.public_correct_answers or {}
    for question in questions:
        correct_answer = public_answers.get(question.id)
        if correct_answer is None and len(questions) == 1:
            correct_answer = payload.public_correct_answer
        if correct_answer is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Public question #{question.id} correct answer is required",
            )
        question.correct_answer = correct_answer

    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))
    if vip_question is not None:
        if payload.vip_correct_answer is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="VIP question correct answer is required",
            )
        vip_question.correct_answer = payload.vip_correct_answer

    score_completed_match(db, match)
    match.status = MatchStatus.completed

    add_system_log(
        db,
        "admin_match_completed",
        user=current_admin,
        payload={
            "match_id": match.id,
            "team_1": match.team_1,
            "team_2": match.team_2,
            "team_1_score": match.team_1_score,
            "team_2_score": match.team_2_score,
        },
    )
    db.commit()
    db.refresh(match)
    expert = db.scalar(select(ExpertPrediction).where(ExpertPrediction.match_id == match.id))
    asyncio.run(publish_to_vip_channel(format_match_result_post(db, match, expert)))
    return match


@router.post("/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
def create_public_question(payload: QuestionCreate, db: Session = Depends(get_db)) -> Question:
    if db.get(Match, payload.match_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    existing_count = db.scalar(select(sa.func.count()).select_from(Question).where(Question.match_id == payload.match_id))
    if existing_count is not None and existing_count >= 2:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match already has two public questions")
    existing_slot = db.scalar(select(Question).where(Question.match_id == payload.match_id, Question.slot == payload.slot))
    if existing_slot is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Public question slot is already used")

    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/questions/{question_id}", response_model=QuestionRead)
def update_public_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)) -> Question:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


@router.post("/vip-questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
def create_vip_question(payload: QuestionCreate, db: Session = Depends(get_db)) -> VipQuestion:
    if db.get(Match, payload.match_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    question = VipQuestion(**payload.model_dump(exclude={"slot"}))
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/vip-questions/{question_id}", response_model=QuestionRead)
def update_vip_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)) -> VipQuestion:
    question = db.get(VipQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VIP question not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question
