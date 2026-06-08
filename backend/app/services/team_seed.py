from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Team, TeamConfederation


@dataclass(frozen=True)
class TeamSeedRow:
    slug: str
    name: str
    short_name: str | None
    fifa_code: str
    flag_emoji: str
    confederation: TeamConfederation


WORLD_CUP_2026_TEAMS: list[TeamSeedRow] = [
    TeamSeedRow("canada", "Canada", "Canada", "CAN", "", TeamConfederation.concacaf),
    TeamSeedRow("mexico", "Mexico", "Mexico", "MEX", "", TeamConfederation.concacaf),
    TeamSeedRow("united-states", "United States", "USA", "USA", "", TeamConfederation.concacaf),
    TeamSeedRow("australia", "Australia", "Australia", "AUS", "", TeamConfederation.afc),
    TeamSeedRow("iraq", "Iraq", "Iraq", "IRQ", "", TeamConfederation.afc),
    TeamSeedRow("iran", "Iran", "Iran", "IRN", "", TeamConfederation.afc),
    TeamSeedRow("japan", "Japan", "Japan", "JPN", "", TeamConfederation.afc),
    TeamSeedRow("jordan", "Jordan", "Jordan", "JOR", "", TeamConfederation.afc),
    TeamSeedRow("korea-republic", "South Korea", "South Korea", "KOR", "", TeamConfederation.afc),
    TeamSeedRow("qatar", "Qatar", "Qatar", "QAT", "", TeamConfederation.afc),
    TeamSeedRow("saudi-arabia", "Saudi Arabia", "Saudi Arabia", "KSA", "", TeamConfederation.afc),
    TeamSeedRow("uzbekistan", "Uzbekistan", "Uzbekistan", "UZB", "", TeamConfederation.afc),
    TeamSeedRow("algeria", "Algeria", "Algeria", "ALG", "", TeamConfederation.caf),
    TeamSeedRow("cabo-verde", "Cabo Verde", "Cabo Verde", "CPV", "", TeamConfederation.caf),
    TeamSeedRow("dr-congo", "DR Congo", "DR Congo", "COD", "", TeamConfederation.caf),
    TeamSeedRow("cote-divoire", "Cote d'Ivoire", "Cote d'Ivoire", "CIV", "", TeamConfederation.caf),
    TeamSeedRow("egypt", "Egypt", "Egypt", "EGY", "", TeamConfederation.caf),
    TeamSeedRow("ghana", "Ghana", "Ghana", "GHA", "", TeamConfederation.caf),
    TeamSeedRow("morocco", "Morocco", "Morocco", "MAR", "", TeamConfederation.caf),
    TeamSeedRow("senegal", "Senegal", "Senegal", "SEN", "", TeamConfederation.caf),
    TeamSeedRow("south-africa", "South Africa", "South Africa", "RSA", "", TeamConfederation.caf),
    TeamSeedRow("tunisia", "Tunisia", "Tunisia", "TUN", "", TeamConfederation.caf),
    TeamSeedRow("curacao", "Curacao", "Curacao", "CUW", "", TeamConfederation.concacaf),
    TeamSeedRow("haiti", "Haiti", "Haiti", "HAI", "", TeamConfederation.concacaf),
    TeamSeedRow("panama", "Panama", "Panama", "PAN", "", TeamConfederation.concacaf),
    TeamSeedRow("argentina", "Argentina", "Argentina", "ARG", "", TeamConfederation.conmebol),
    TeamSeedRow("brazil", "Brazil", "Brazil", "BRA", "", TeamConfederation.conmebol),
    TeamSeedRow("colombia", "Colombia", "Colombia", "COL", "", TeamConfederation.conmebol),
    TeamSeedRow("ecuador", "Ecuador", "Ecuador", "ECU", "", TeamConfederation.conmebol),
    TeamSeedRow("paraguay", "Paraguay", "Paraguay", "PAR", "", TeamConfederation.conmebol),
    TeamSeedRow("uruguay", "Uruguay", "Uruguay", "URU", "", TeamConfederation.conmebol),
    TeamSeedRow("new-zealand", "New Zealand", "New Zealand", "NZL", "", TeamConfederation.ofc),
    TeamSeedRow("austria", "Austria", "Austria", "AUT", "", TeamConfederation.uefa),
    TeamSeedRow("belgium", "Belgium", "Belgium", "BEL", "", TeamConfederation.uefa),
    TeamSeedRow("bosnia-and-herzegovina", "Bosnia and Herzegovina", "Bosnia and Herzegovina", "BIH", "", TeamConfederation.uefa),
    TeamSeedRow("croatia", "Croatia", "Croatia", "CRO", "", TeamConfederation.uefa),
    TeamSeedRow("czechia", "Czechia", "Czechia", "CZE", "", TeamConfederation.uefa),
    TeamSeedRow("england", "England", "England", "ENG", "", TeamConfederation.uefa),
    TeamSeedRow("france", "France", "France", "FRA", "", TeamConfederation.uefa),
    TeamSeedRow("germany", "Germany", "Germany", "GER", "", TeamConfederation.uefa),
    TeamSeedRow("netherlands", "Netherlands", "Netherlands", "NED", "", TeamConfederation.uefa),
    TeamSeedRow("norway", "Norway", "Norway", "NOR", "", TeamConfederation.uefa),
    TeamSeedRow("portugal", "Portugal", "Portugal", "POR", "", TeamConfederation.uefa),
    TeamSeedRow("scotland", "Scotland", "Scotland", "SCO", "", TeamConfederation.uefa),
    TeamSeedRow("spain", "Spain", "Spain", "ESP", "", TeamConfederation.uefa),
    TeamSeedRow("sweden", "Sweden", "Sweden", "SWE", "", TeamConfederation.uefa),
    TeamSeedRow("switzerland", "Switzerland", "Switzerland", "SUI", "", TeamConfederation.uefa),
    TeamSeedRow("turkiye", "Turkiye", "Turkiye", "TUR", "", TeamConfederation.uefa),
]


def seed_world_cup_2026_teams(db: Session) -> tuple[int, int]:
    created = 0
    updated = 0

    for row in WORLD_CUP_2026_TEAMS:
        team = db.scalar(select(Team).where(Team.slug == row.slug))
        if team is None:
            team = db.scalar(select(Team).where(Team.fifa_code == row.fifa_code))

        if team is None:
            db.add(
                Team(
                    slug=row.slug,
                    name=row.name,
                    short_name=row.short_name,
                    fifa_code=row.fifa_code,
                    flag_emoji=row.flag_emoji,
                    confederation=row.confederation,
                    is_national_team=True,
                    is_placeholder=False,
                )
            )
            created += 1
            continue

        team.slug = row.slug
        team.name = row.name
        team.short_name = row.short_name
        team.fifa_code = row.fifa_code
        team.flag_emoji = row.flag_emoji
        team.confederation = row.confederation
        team.is_national_team = True
        team.is_placeholder = False
        updated += 1

    return created, updated
