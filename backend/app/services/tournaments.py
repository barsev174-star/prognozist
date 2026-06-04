from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    League,
    LeagueMember,
    LeagueResult,
    LeagueStatus,
    Match,
    MatchStatus,
    Tournament,
    TournamentResult,
    TournamentStatus,
    User,
)
from app.services.rankings import build_league_ranking, build_tournament_ranking
from app.services.achievements import check_tournament_result_achievements


@dataclass(frozen=True)
class TournamentCompletionReadiness:
    total_matches: int
    completed_matches: int
    can_complete: bool


@dataclass(frozen=True)
class TournamentCompletionResult:
    tournament_id: int
    tournament_results_created: int
    leagues_archived: int
    league_results_created: int
    archived_league_ids: list[int]


def get_completion_readiness(db: Session, tournament_id: int) -> TournamentCompletionReadiness:
    total_matches = db.scalar(select(func.count()).select_from(Match).where(Match.tournament_id == tournament_id)) or 0
    completed_matches = db.scalar(
        select(func.count()).select_from(Match).where(
            Match.tournament_id == tournament_id,
            Match.status == MatchStatus.completed,
        )
    ) or 0
    return TournamentCompletionReadiness(
        total_matches=total_matches,
        completed_matches=completed_matches,
        can_complete=total_matches > 0 and total_matches == completed_matches,
    )


def complete_tournament(db: Session, tournament: Tournament) -> TournamentCompletionResult:
    readiness = get_completion_readiness(db, tournament.id)
    if not readiness.can_complete:
        raise ValueError("All tournament matches must be completed")
    if tournament.status == TournamentStatus.completed:
        raise ValueError("Tournament is already completed")

    now = datetime.now(UTC)
    tournament.status = TournamentStatus.completed
    tournament.completed_at = now

    tournament_results_created = snapshot_tournament_results(db, tournament)
    league_result_count = 0
    archived_count = 0
    archived_league_ids: list[int] = []

    leagues = db.scalars(select(League).where(League.tournament_id == tournament.id)).all()
    for league in leagues:
        league_result_count += snapshot_league_results(db, league)
        if league.status != LeagueStatus.archived:
            league.status = LeagueStatus.archived
            league.completed_at = league.completed_at or now
            archived_count += 1
            archived_league_ids.append(league.id)

    check_tournament_result_achievements(db, tournament.id)

    return TournamentCompletionResult(
        tournament_id=tournament.id,
        tournament_results_created=tournament_results_created,
        leagues_archived=archived_count,
        league_results_created=league_result_count,
        archived_league_ids=archived_league_ids,
    )


def snapshot_tournament_results(db: Session, tournament: Tournament) -> int:
    existing = db.scalar(
        select(func.count()).select_from(TournamentResult).where(TournamentResult.tournament_id == tournament.id)
    ) or 0
    if existing > 0:
        return 0

    system_user = get_system_user_for_rankings(db)
    ranking = build_tournament_ranking(db, tournament.id, system_user, limit=10_000)
    for entry in ranking.entries:
        db.add(
            TournamentResult(
                tournament_id=tournament.id,
                user_id=entry.user_id,
                final_rank=entry.rank,
                final_points=entry.points,
            )
        )
    return len(ranking.entries)


def snapshot_league_results(db: Session, league: League) -> int:
    existing = db.scalar(select(func.count()).select_from(LeagueResult).where(LeagueResult.league_id == league.id)) or 0
    if existing > 0:
        return 0

    system_user = get_system_user_for_rankings(db)
    ranking = build_league_ranking(db, league.id, system_user, limit=10_000)
    for entry in ranking.entries:
        db.add(
            LeagueResult(
                league_id=league.id,
                user_id=entry.user_id,
                final_rank=entry.rank,
                final_points=entry.points,
            )
        )
    return len(ranking.entries)


def get_system_user_for_rankings(db: Session) -> User:
    user = db.scalar(select(User).order_by(User.id.asc()).limit(1))
    if user is None:
        raise ValueError("At least one user is required to build rankings")
    return user
