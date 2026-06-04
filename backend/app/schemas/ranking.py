from pydantic import BaseModel


class RankingEntry(BaseModel):
    rank: int
    user_id: int
    telegram_id: int
    username: str | None
    first_name: str | None
    points: int
    is_current_user: bool = False


class RankingResponse(BaseModel):
    entries: list[RankingEntry]
    current_user_entry: RankingEntry | None = None


class UserRankingPositions(BaseModel):
    global_rank: int | None = None
    global_points: int = 0
    season_rank: int | None = None
    season_points: int = 0
    tournament_rank: int | None = None
    tournament_points: int = 0

