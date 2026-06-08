from dataclasses import dataclass

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models import (
    League,
    LeagueMember,
    Match,
    PointsLog,
    Prediction,
    Question,
    QuestionAnswer,
    Tournament,
    User,
    VipQuestion,
    VipQuestionAnswer,
)
from app.schemas.ranking import RankingEntry, RankingResponse, UserRankingPositions


@dataclass(frozen=True)
class RankingScope:
    season_id: int | None = None
    tournament_id: int | None = None
    league_id: int | None = None


def build_global_ranking(db: Session, current_user: User, limit: int = 50) -> RankingResponse:
    rows = db.execute(
        select(
            User.id,
            User.telegram_id,
            User.username,
            User.first_name,
            User.points_total.label("points"),
        )
        .where(User.is_blocked.is_(False))
        .order_by(User.points_total.desc(), User.id.asc())
    ).all()
    return build_response_from_rows(rows, current_user.id, limit)


def build_season_ranking(db: Session, season_id: int, current_user: User, limit: int = 50) -> RankingResponse:
    tournament_ids = select(Tournament.id).where(Tournament.season_id == season_id)
    return build_points_log_ranking(db, current_user, limit, tournament_ids=tournament_ids)


def build_tournament_ranking(db: Session, tournament_id: int, current_user: User, limit: int = 50) -> RankingResponse:
    tournament_ids = select(Tournament.id).where(Tournament.id == tournament_id)
    return build_points_log_ranking(db, current_user, limit, tournament_ids=tournament_ids)


def build_league_ranking(db: Session, league_id: int, current_user: User, limit: int = 50) -> RankingResponse:
    league = db.get(League, league_id)
    if league is None:
        return RankingResponse(entries=[], current_user_entry=None)

    tournament_ids = select(Tournament.id).where(Tournament.id == league.tournament_id)
    return build_points_log_ranking(
        db,
        current_user,
        limit,
        tournament_ids=tournament_ids,
        league_id=league_id,
    )


def build_points_log_ranking(
    db: Session,
    current_user: User,
    limit: int,
    tournament_ids: Select[tuple[int]],
    league_id: int | None = None,
) -> RankingResponse:
    user_points = tournament_points_query(tournament_ids).subquery()

    if league_id is not None:
        query = (
            select(
                User.id,
                User.telegram_id,
                User.username,
                User.first_name,
                func.coalesce(user_points.c.points, 0).label("points"),
            )
            .join(
                LeagueMember,
                (LeagueMember.user_id == User.id) & (LeagueMember.league_id == league_id),
            )
            .outerjoin(user_points, user_points.c.user_id == User.id)
            .where(User.is_blocked.is_(False))
            .order_by(func.coalesce(user_points.c.points, 0).desc(), User.id.asc())
        )
    else:
        query = (
            select(
                User.id,
                User.telegram_id,
                User.username,
                User.first_name,
                func.coalesce(user_points.c.points, 0).label("points"),
            )
            .join(user_points, user_points.c.user_id == User.id)
            .where(User.is_blocked.is_(False))
            .order_by(user_points.c.points.desc(), User.id.asc())
        )

    rows = db.execute(query).all()
    return build_response_from_rows(rows, current_user.id, limit)


def tournament_points_query(tournament_ids: Select[tuple[int]]) -> Select:
    score_prediction_points = (
        select(PointsLog.user_id, PointsLog.points)
        .join(Prediction, Prediction.id == PointsLog.source_id)
        .join(Match, Match.id == Prediction.match_id)
        .where(
            PointsLog.source_type == "score_prediction",
            Match.tournament_id.in_(tournament_ids),
        )
    )

    public_question_points = (
        select(PointsLog.user_id, PointsLog.points)
        .join(QuestionAnswer, QuestionAnswer.id == PointsLog.source_id)
        .join(Question, Question.id == QuestionAnswer.question_id)
        .join(Match, Match.id == Question.match_id)
        .where(
            PointsLog.source_type == "public_question_answer",
            Match.tournament_id.in_(tournament_ids),
        )
    )

    vip_question_points = (
        select(PointsLog.user_id, PointsLog.points)
        .join(VipQuestionAnswer, VipQuestionAnswer.id == PointsLog.source_id)
        .join(VipQuestion, VipQuestion.id == VipQuestionAnswer.vip_question_id)
        .join(Match, Match.id == VipQuestion.match_id)
        .where(
            PointsLog.source_type == "vip_question_answer",
            Match.tournament_id.in_(tournament_ids),
        )
    )

    all_points = score_prediction_points.union_all(public_question_points, vip_question_points).subquery()
    return select(
        all_points.c.user_id,
        func.sum(all_points.c.points).label("points"),
    ).group_by(all_points.c.user_id)


def build_response_from_rows(rows, current_user_id: int, limit: int) -> RankingResponse:
    entries: list[RankingEntry] = []
    current_user_entry: RankingEntry | None = None

    for index, row in enumerate(rows, start=1):
        entry = RankingEntry(
            rank=index,
            user_id=row.id,
            telegram_id=row.telegram_id,
            username=row.username,
            first_name=row.first_name,
            points=row.points,
            is_current_user=row.id == current_user_id,
        )

        if entry.is_current_user:
            current_user_entry = entry
        if index <= limit:
            entries.append(entry)

    return RankingResponse(entries=entries, current_user_entry=current_user_entry)


def get_user_positions(
    db: Session,
    current_user: User,
    season_id: int | None = None,
    tournament_id: int | None = None,
) -> UserRankingPositions:
    global_ranking = build_global_ranking(db, current_user, limit=0)
    season_ranking = build_season_ranking(db, season_id, current_user, limit=0) if season_id is not None else None
    tournament_ranking = (
        build_tournament_ranking(db, tournament_id, current_user, limit=0) if tournament_id is not None else None
    )

    return UserRankingPositions(
        global_rank=global_ranking.current_user_entry.rank if global_ranking.current_user_entry else None,
        global_points=global_ranking.current_user_entry.points if global_ranking.current_user_entry else current_user.points_total,
        season_rank=season_ranking.current_user_entry.rank if season_ranking and season_ranking.current_user_entry else None,
        season_points=season_ranking.current_user_entry.points if season_ranking and season_ranking.current_user_entry else 0,
        tournament_rank=(
            tournament_ranking.current_user_entry.rank
            if tournament_ranking and tournament_ranking.current_user_entry
            else None
        ),
        tournament_points=(
            tournament_ranking.current_user_entry.points
            if tournament_ranking and tournament_ranking.current_user_entry
            else 0
        ),
    )
