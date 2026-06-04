from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import League, Season, Tournament, User
from app.schemas.ranking import RankingResponse, UserRankingPositions
from app.services.rankings import (
    build_global_ranking,
    build_league_ranking,
    build_season_ranking,
    build_tournament_ranking,
    get_user_positions,
)

router = APIRouter(prefix="/rankings", tags=["Rankings"])


@router.get("/global", response_model=RankingResponse)
def get_global_ranking(
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RankingResponse:
    return build_global_ranking(db, current_user, limit)


@router.get("/season/{season_id}", response_model=RankingResponse)
def get_season_ranking(
    season_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RankingResponse:
    if db.get(Season, season_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")
    return build_season_ranking(db, season_id, current_user, limit)


@router.get("/tournament/{tournament_id}", response_model=RankingResponse)
def get_tournament_ranking(
    tournament_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RankingResponse:
    if db.get(Tournament, tournament_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return build_tournament_ranking(db, tournament_id, current_user, limit)


@router.get("/league/{league_id}", response_model=RankingResponse)
def get_league_ranking(
    league_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RankingResponse:
    if db.get(League, league_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="League not found")
    return build_league_ranking(db, league_id, current_user, limit)


@router.get("/me", response_model=UserRankingPositions)
def get_my_ranking_positions(
    season_id: int | None = None,
    tournament_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserRankingPositions:
    if season_id is not None and db.get(Season, season_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")
    if tournament_id is not None and db.get(Tournament, tournament_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return get_user_positions(db, current_user, season_id=season_id, tournament_id=tournament_id)

