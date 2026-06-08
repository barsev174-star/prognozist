import secrets
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import League, LeagueMember, LeagueStatus, Tournament, TournamentStatus, User
from app.schemas.league import (
    DEFAULT_PRIZE_DESCRIPTION,
    LeagueCreate,
    LeagueDetail,
    LeagueJoinRequest,
    LeagueRankingResponse,
    LeagueRead,
    LeagueUpdate,
)
from app.services.rankings import build_league_ranking

router = APIRouter(prefix="/leagues", tags=["Leagues"])


def normalize_prize_description(value: str | None) -> str:
    if value is None:
        return DEFAULT_PRIZE_DESCRIPTION
    stripped = value.strip()
    return stripped or DEFAULT_PRIZE_DESCRIPTION


def generate_invite_code() -> str:
    return secrets.token_urlsafe(8)


def create_unique_invite_code(db: Session) -> str:
    for _ in range(10):
        code = generate_invite_code()
        exists = db.scalar(select(League.id).where(League.invite_code == code))
        if exists is None:
            return code
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not generate invite code")


def ensure_joinable_league(league: League) -> None:
    if league.status != LeagueStatus.active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="League is not active")


def ensure_tournament_accepts_leagues(tournament: Tournament) -> None:
    if tournament.status == TournamentStatus.completed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tournament is completed")


def get_member_count(db: Session, league_id: int) -> int:
    return db.scalar(select(func.count()).select_from(LeagueMember).where(LeagueMember.league_id == league_id)) or 0


def is_member(db: Session, league_id: int, user_id: int) -> bool:
    return (
        db.get(
            LeagueMember,
            {"league_id": league_id, "user_id": user_id},
        )
        is not None
    )


def to_league_detail(db: Session, league: League, current_user: User) -> LeagueDetail:
    data = LeagueRead.model_validate(league).model_dump()
    return LeagueDetail(
        **data,
        members_count=get_member_count(db, league.id),
        is_owner=league.owner_id == current_user.id,
        is_member=is_member(db, league.id, current_user.id),
    )


@router.post("", response_model=LeagueDetail, status_code=status.HTTP_201_CREATED)
def create_league(
    payload: LeagueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeagueDetail:
    tournament = db.get(Tournament, payload.tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    ensure_tournament_accepts_leagues(tournament)

    league = League(
        owner_id=current_user.id,
        tournament_id=payload.tournament_id,
        name=payload.name,
        description=payload.description,
        prize_description=normalize_prize_description(payload.prize_description),
        invite_code=create_unique_invite_code(db),
    )
    db.add(league)
    db.flush()

    db.add(
        LeagueMember(
            league_id=league.id,
            user_id=current_user.id,
            joined_at=datetime.now(UTC),
        )
    )

    db.commit()
    db.refresh(league)
    return to_league_detail(db, league, current_user)


@router.get("", response_model=list[LeagueDetail])
def list_my_leagues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[LeagueDetail]:
    leagues = db.scalars(
        select(League)
        .join(LeagueMember, LeagueMember.league_id == League.id)
        .where(LeagueMember.user_id == current_user.id)
        .order_by(League.created_at.desc(), League.id.desc())
    ).all()
    return [to_league_detail(db, league, current_user) for league in leagues]


@router.post("/join", response_model=LeagueDetail)
def join_league(
    payload: LeagueJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeagueDetail:
    league = db.scalar(select(League).where(League.invite_code == payload.invite_code))
    if league is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="League not found")

    ensure_joinable_league(league)
    tournament = db.get(Tournament, league.tournament_id)
    if tournament is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    ensure_tournament_accepts_leagues(tournament)

    membership = db.get(LeagueMember, {"league_id": league.id, "user_id": current_user.id})
    if membership is None:
        db.add(
            LeagueMember(
                league_id=league.id,
                user_id=current_user.id,
                joined_at=datetime.now(UTC),
            )
        )
        db.commit()
        db.refresh(league)

    return to_league_detail(db, league, current_user)


@router.get("/{league_id}", response_model=LeagueDetail)
def get_league(
    league_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeagueDetail:
    league = db.get(League, league_id)
    if league is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="League not found")
    if not is_member(db, league.id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="League membership required")
    return to_league_detail(db, league, current_user)


@router.patch("/{league_id}", response_model=LeagueDetail)
def update_league(
    league_id: int,
    payload: LeagueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeagueDetail:
    league = db.get(League, league_id)
    if league is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="League not found")
    if league.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only league owner can edit league")
    ensure_joinable_league(league)

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "prize_description":
            value = normalize_prize_description(value)
        setattr(league, field, value)

    db.commit()
    db.refresh(league)
    return to_league_detail(db, league, current_user)


@router.get("/{league_id}/ranking", response_model=LeagueRankingResponse)
def get_league_with_ranking(
    league_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeagueRankingResponse:
    league = db.get(League, league_id)
    if league is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="League not found")
    if not is_member(db, league.id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="League membership required")

    return LeagueRankingResponse(
        league=to_league_detail(db, league, current_user),
        ranking=build_league_ranking(db, league.id, current_user),
    )
