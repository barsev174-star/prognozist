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
    TeamSeedRow("canada", "\u041a\u0430\u043d\u0430\u0434\u0430", "\u041a\u0430\u043d\u0430\u0434\u0430", "CAN", "\U0001F1E8\U0001F1E6", TeamConfederation.concacaf),
    TeamSeedRow("mexico", "\u041c\u0435\u043a\u0441\u0438\u043a\u0430", "\u041c\u0435\u043a\u0441\u0438\u043a\u0430", "MEX", "\U0001F1F2\U0001F1FD", TeamConfederation.concacaf),
    TeamSeedRow("united-states", "\u0421\u0428\u0410", "\u0421\u0428\u0410", "USA", "\U0001F1FA\U0001F1F8", TeamConfederation.concacaf),
    TeamSeedRow("australia", "\u0410\u0432\u0441\u0442\u0440\u0430\u043b\u0438\u044f", "\u0410\u0432\u0441\u0442\u0440\u0430\u043b\u0438\u044f", "AUS", "\U0001F1E6\U0001F1FA", TeamConfederation.afc),
    TeamSeedRow("iraq", "\u0418\u0440\u0430\u043a", "\u0418\u0440\u0430\u043a", "IRQ", "\U0001F1EE\U0001F1F6", TeamConfederation.afc),
    TeamSeedRow("iran", "\u0418\u0440\u0430\u043d", "\u0418\u0440\u0430\u043d", "IRN", "\U0001F1EE\U0001F1F7", TeamConfederation.afc),
    TeamSeedRow("japan", "\u042f\u043f\u043e\u043d\u0438\u044f", "\u042f\u043f\u043e\u043d\u0438\u044f", "JPN", "\U0001F1EF\U0001F1F5", TeamConfederation.afc),
    TeamSeedRow("jordan", "\u0418\u043e\u0440\u0434\u0430\u043d\u0438\u044f", "\u0418\u043e\u0440\u0434\u0430\u043d\u0438\u044f", "JOR", "\U0001F1EF\U0001F1F4", TeamConfederation.afc),
    TeamSeedRow("korea-republic", "\u042e\u0436\u043d\u0430\u044f \u041a\u043e\u0440\u0435\u044f", "\u042e\u0436\u043d\u0430\u044f \u041a\u043e\u0440\u0435\u044f", "KOR", "\U0001F1F0\U0001F1F7", TeamConfederation.afc),
    TeamSeedRow("qatar", "\u041a\u0430\u0442\u0430\u0440", "\u041a\u0430\u0442\u0430\u0440", "QAT", "\U0001F1F6\U0001F1E6", TeamConfederation.afc),
    TeamSeedRow("saudi-arabia", "\u0421\u0430\u0443\u0434\u043e\u0432\u0441\u043a\u0430\u044f \u0410\u0440\u0430\u0432\u0438\u044f", "\u0421\u0430\u0443\u0434\u043e\u0432\u0441\u043a\u0430\u044f \u0410\u0440\u0430\u0432\u0438\u044f", "KSA", "\U0001F1F8\U0001F1E6", TeamConfederation.afc),
    TeamSeedRow("uzbekistan", "\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d", "\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d", "UZB", "\U0001F1FA\U0001F1FF", TeamConfederation.afc),
    TeamSeedRow("algeria", "\u0410\u043b\u0436\u0438\u0440", "\u0410\u043b\u0436\u0438\u0440", "ALG", "\U0001F1E9\U0001F1FF", TeamConfederation.caf),
    TeamSeedRow("cabo-verde", "\u041a\u0430\u0431\u043e-\u0412\u0435\u0440\u0434\u0435", "\u041a\u0430\u0431\u043e-\u0412\u0435\u0440\u0434\u0435", "CPV", "\U0001F1E8\U0001F1FB", TeamConfederation.caf),
    TeamSeedRow("dr-congo", "\u0414\u0420 \u041a\u043e\u043d\u0433\u043e", "\u0414\u0420 \u041a\u043e\u043d\u0433\u043e", "COD", "\U0001F1E8\U0001F1E9", TeamConfederation.caf),
    TeamSeedRow("cote-divoire", "\u041a\u043e\u0442-\u0434'\u0418\u0432\u0443\u0430\u0440", "\u041a\u043e\u0442-\u0434'\u0418\u0432\u0443\u0430\u0440", "CIV", "\U0001F1E8\U0001F1EE", TeamConfederation.caf),
    TeamSeedRow("egypt", "\u0415\u0433\u0438\u043f\u0435\u0442", "\u0415\u0433\u0438\u043f\u0435\u0442", "EGY", "\U0001F1EA\U0001F1EC", TeamConfederation.caf),
    TeamSeedRow("ghana", "\u0413\u0430\u043d\u0430", "\u0413\u0430\u043d\u0430", "GHA", "\U0001F1EC\U0001F1ED", TeamConfederation.caf),
    TeamSeedRow("morocco", "\u041c\u0430\u0440\u043e\u043a\u043a\u043e", "\u041c\u0430\u0440\u043e\u043a\u043a\u043e", "MAR", "\U0001F1F2\U0001F1E6", TeamConfederation.caf),
    TeamSeedRow("senegal", "\u0421\u0435\u043d\u0435\u0433\u0430\u043b", "\u0421\u0435\u043d\u0435\u0433\u0430\u043b", "SEN", "\U0001F1F8\U0001F1F3", TeamConfederation.caf),
    TeamSeedRow("south-africa", "\u042e\u0410\u0420", "\u042e\u0410\u0420", "RSA", "\U0001F1FF\U0001F1E6", TeamConfederation.caf),
    TeamSeedRow("tunisia", "\u0422\u0443\u043d\u0438\u0441", "\u0422\u0443\u043d\u0438\u0441", "TUN", "\U0001F1F9\U0001F1F3", TeamConfederation.caf),
    TeamSeedRow("curacao", "\u041a\u044e\u0440\u0430\u0441\u0430\u043e", "\u041a\u044e\u0440\u0430\u0441\u0430\u043e", "CUW", "\U0001F1E8\U0001F1FC", TeamConfederation.concacaf),
    TeamSeedRow("haiti", "\u0413\u0430\u0438\u0442\u0438", "\u0413\u0430\u0438\u0442\u0438", "HAI", "\U0001F1ED\U0001F1F9", TeamConfederation.concacaf),
    TeamSeedRow("panama", "\u041f\u0430\u043d\u0430\u043c\u0430", "\u041f\u0430\u043d\u0430\u043c\u0430", "PAN", "\U0001F1F5\U0001F1E6", TeamConfederation.concacaf),
    TeamSeedRow("argentina", "\u0410\u0440\u0433\u0435\u043d\u0442\u0438\u043d\u0430", "\u0410\u0440\u0433\u0435\u043d\u0442\u0438\u043d\u0430", "ARG", "\U0001F1E6\U0001F1F7", TeamConfederation.conmebol),
    TeamSeedRow("brazil", "\u0411\u0440\u0430\u0437\u0438\u043b\u0438\u044f", "\u0411\u0440\u0430\u0437\u0438\u043b\u0438\u044f", "BRA", "\U0001F1E7\U0001F1F7", TeamConfederation.conmebol),
    TeamSeedRow("colombia", "\u041a\u043e\u043b\u0443\u043c\u0431\u0438\u044f", "\u041a\u043e\u043b\u0443\u043c\u0431\u0438\u044f", "COL", "\U0001F1E8\U0001F1F4", TeamConfederation.conmebol),
    TeamSeedRow("ecuador", "\u042d\u043a\u0432\u0430\u0434\u043e\u0440", "\u042d\u043a\u0432\u0430\u0434\u043e\u0440", "ECU", "\U0001F1EA\U0001F1E8", TeamConfederation.conmebol),
    TeamSeedRow("paraguay", "\u041f\u0430\u0440\u0430\u0433\u0432\u0430\u0439", "\u041f\u0430\u0440\u0430\u0433\u0432\u0430\u0439", "PAR", "\U0001F1F5\U0001F1FE", TeamConfederation.conmebol),
    TeamSeedRow("uruguay", "\u0423\u0440\u0443\u0433\u0432\u0430\u0439", "\u0423\u0440\u0443\u0433\u0432\u0430\u0439", "URU", "\U0001F1FA\U0001F1FE", TeamConfederation.conmebol),
    TeamSeedRow("new-zealand", "\u041d\u043e\u0432\u0430\u044f \u0417\u0435\u043b\u0430\u043d\u0434\u0438\u044f", "\u041d\u043e\u0432\u0430\u044f \u0417\u0435\u043b\u0430\u043d\u0434\u0438\u044f", "NZL", "\U0001F1F3\U0001F1FF", TeamConfederation.ofc),
    TeamSeedRow("austria", "\u0410\u0432\u0441\u0442\u0440\u0438\u044f", "\u0410\u0432\u0441\u0442\u0440\u0438\u044f", "AUT", "\U0001F1E6\U0001F1F9", TeamConfederation.uefa),
    TeamSeedRow("belgium", "\u0411\u0435\u043b\u044c\u0433\u0438\u044f", "\u0411\u0435\u043b\u044c\u0433\u0438\u044f", "BEL", "\U0001F1E7\U0001F1EA", TeamConfederation.uefa),
    TeamSeedRow("bosnia-and-herzegovina", "\u0411\u043e\u0441\u043d\u0438\u044f \u0438 \u0413\u0435\u0440\u0446\u0435\u0433\u043e\u0432\u0438\u043d\u0430", "\u0411\u043e\u0441\u043d\u0438\u044f \u0438 \u0413\u0435\u0440\u0446\u0435\u0433\u043e\u0432\u0438\u043d\u0430", "BIH", "\U0001F1E7\U0001F1E6", TeamConfederation.uefa),
    TeamSeedRow("croatia", "\u0425\u043e\u0440\u0432\u0430\u0442\u0438\u044f", "\u0425\u043e\u0440\u0432\u0430\u0442\u0438\u044f", "CRO", "\U0001F1ED\U0001F1F7", TeamConfederation.uefa),
    TeamSeedRow("czechia", "\u0427\u0435\u0445\u0438\u044f", "\u0427\u0435\u0445\u0438\u044f", "CZE", "\U0001F1E8\U0001F1FF", TeamConfederation.uefa),
    TeamSeedRow("england", "\u0410\u043d\u0433\u043b\u0438\u044f", "\u0410\u043d\u0433\u043b\u0438\u044f", "ENG", "\U0001F3F4\U000E0067\U000E0062\U000E0065\U000E006E\U000E0067\U000E007F", TeamConfederation.uefa),
    TeamSeedRow("france", "\u0424\u0440\u0430\u043d\u0446\u0438\u044f", "\u0424\u0440\u0430\u043d\u0446\u0438\u044f", "FRA", "\U0001F1EB\U0001F1F7", TeamConfederation.uefa),
    TeamSeedRow("germany", "\u0413\u0435\u0440\u043c\u0430\u043d\u0438\u044f", "\u0413\u0435\u0440\u043c\u0430\u043d\u0438\u044f", "GER", "\U0001F1E9\U0001F1EA", TeamConfederation.uefa),
    TeamSeedRow("netherlands", "\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u044b", "\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u044b", "NED", "\U0001F1F3\U0001F1F1", TeamConfederation.uefa),
    TeamSeedRow("norway", "\u041d\u043e\u0440\u0432\u0435\u0433\u0438\u044f", "\u041d\u043e\u0440\u0432\u0435\u0433\u0438\u044f", "NOR", "\U0001F1F3\U0001F1F4", TeamConfederation.uefa),
    TeamSeedRow("portugal", "\u041f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u0438\u044f", "\u041f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u0438\u044f", "POR", "\U0001F1F5\U0001F1F9", TeamConfederation.uefa),
    TeamSeedRow("scotland", "\u0428\u043e\u0442\u043b\u0430\u043d\u0434\u0438\u044f", "\u0428\u043e\u0442\u043b\u0430\u043d\u0434\u0438\u044f", "SCO", "\U0001F3F4\U000E0067\U000E0062\U000E0073\U000E0063\U000E0074\U000E007F", TeamConfederation.uefa),
    TeamSeedRow("spain", "\u0418\u0441\u043f\u0430\u043d\u0438\u044f", "\u0418\u0441\u043f\u0430\u043d\u0438\u044f", "ESP", "\U0001F1EA\U0001F1F8", TeamConfederation.uefa),
    TeamSeedRow("sweden", "\u0428\u0432\u0435\u0446\u0438\u044f", "\u0428\u0432\u0435\u0446\u0438\u044f", "SWE", "\U0001F1F8\U0001F1EA", TeamConfederation.uefa),
    TeamSeedRow("switzerland", "\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044f", "\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044f", "SUI", "\U0001F1E8\U0001F1ED", TeamConfederation.uefa),
    TeamSeedRow("turkiye", "\u0422\u0443\u0440\u0446\u0438\u044f", "\u0422\u0443\u0440\u0446\u0438\u044f", "TUR", "\U0001F1F9\U0001F1F7", TeamConfederation.uefa),
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
                    logo_url=None,
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
        team.logo_url = None
        team.confederation = row.confederation
        team.is_national_team = True
        team.is_placeholder = False
        updated += 1

    return created, updated
