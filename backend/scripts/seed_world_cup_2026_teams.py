from app.db.session import SessionLocal
from app.services.team_seed import seed_world_cup_2026_teams


def main() -> None:
    db = SessionLocal()
    try:
        created, updated = seed_world_cup_2026_teams(db)
        db.commit()
        print(f"World Cup 2026 teams seeded: created={created}, updated={updated}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
