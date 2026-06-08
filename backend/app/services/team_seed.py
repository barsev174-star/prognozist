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
    TeamSeedRow("canada", "Канада", "Канада", "CAN", "🇨🇦", TeamConfederation.concacaf),
    TeamSeedRow("mexico", "Мексика", "Мексика", "MEX", "🇲🇽", TeamConfederation.concacaf),
    TeamSeedRow("united-states", "США", "США", "USA", "🇺🇸", TeamConfederation.concacaf),
    TeamSeedRow("australia", "Австралия", "Австралия", "AUS", "🇦🇺", TeamConfederation.afc),
    TeamSeedRow("iraq", "Ирак", "Ирак", "IRQ", "🇮🇶", TeamConfederation.afc),
    TeamSeedRow("iran", "Иран", "Иран", "IRN", "🇮🇷", TeamConfederation.afc),
    TeamSeedRow("japan", "Япония", "Япония", "JPN", "🇯🇵", TeamConfederation.afc),
    TeamSeedRow("jordan", "Иордания", "Иордания", "JOR", "🇯🇴", TeamConfederation.afc),
    TeamSeedRow("korea-republic", "Южная Корея", "Южная Корея", "KOR", "🇰🇷", TeamConfederation.afc),
    TeamSeedRow("qatar", "Катар", "Катар", "QAT", "🇶🇦", TeamConfederation.afc),
    TeamSeedRow("saudi-arabia", "Саудовская Аравия", "Саудовская Аравия", "KSA", "🇸🇦", TeamConfederation.afc),
    TeamSeedRow("uzbekistan", "Узбекистан", "Узбекистан", "UZB", "🇺🇿", TeamConfederation.afc),
    TeamSeedRow("algeria", "Алжир", "Алжир", "ALG", "🇩🇿", TeamConfederation.caf),
    TeamSeedRow("cabo-verde", "Кабо-Верде", "Кабо-Верде", "CPV", "🇨🇻", TeamConfederation.caf),
    TeamSeedRow("dr-congo", "ДР Конго", "ДР Конго", "COD", "🇨🇩", TeamConfederation.caf),
    TeamSeedRow("cote-divoire", "Кот-д'Ивуар", "Кот-д'Ивуар", "CIV", "🇨🇮", TeamConfederation.caf),
    TeamSeedRow("egypt", "Египет", "Египет", "EGY", "🇪🇬", TeamConfederation.caf),
    TeamSeedRow("ghana", "Гана", "Гана", "GHA", "🇬🇭", TeamConfederation.caf),
    TeamSeedRow("morocco", "Марокко", "Марокко", "MAR", "🇲🇦", TeamConfederation.caf),
    TeamSeedRow("senegal", "Сенегал", "Сенегал", "SEN", "🇸🇳", TeamConfederation.caf),
    TeamSeedRow("south-africa", "ЮАР", "ЮАР", "RSA", "🇿🇦", TeamConfederation.caf),
    TeamSeedRow("tunisia", "Тунис", "Тунис", "TUN", "🇹🇳", TeamConfederation.caf),
    TeamSeedRow("curacao", "Кюрасао", "Кюрасао", "CUW", "🇨🇼", TeamConfederation.concacaf),
    TeamSeedRow("haiti", "Гаити", "Гаити", "HAI", "🇭🇹", TeamConfederation.concacaf),
    TeamSeedRow("panama", "Панама", "Панама", "PAN", "🇵🇦", TeamConfederation.concacaf),
    TeamSeedRow("argentina", "Аргентина", "Аргентина", "ARG", "🇦🇷", TeamConfederation.conmebol),
    TeamSeedRow("brazil", "Бразилия", "Бразилия", "BRA", "🇧🇷", TeamConfederation.conmebol),
    TeamSeedRow("colombia", "Колумбия", "Колумбия", "COL", "🇨🇴", TeamConfederation.conmebol),
    TeamSeedRow("ecuador", "Эквадор", "Эквадор", "ECU", "🇪🇨", TeamConfederation.conmebol),
    TeamSeedRow("paraguay", "Парагвай", "Парагвай", "PAR", "🇵🇾", TeamConfederation.conmebol),
    TeamSeedRow("uruguay", "Уругвай", "Уругвай", "URU", "🇺🇾", TeamConfederation.conmebol),
    TeamSeedRow("new-zealand", "Новая Зеландия", "Новая Зеландия", "NZL", "🇳🇿", TeamConfederation.ofc),
    TeamSeedRow("austria", "Австрия", "Австрия", "AUT", "🇦🇹", TeamConfederation.uefa),
    TeamSeedRow("belgium", "Бельгия", "Бельгия", "BEL", "🇧🇪", TeamConfederation.uefa),
    TeamSeedRow("bosnia-and-herzegovina", "Босния и Герцеговина", "Босния и Герцеговина", "BIH", "🇧🇦", TeamConfederation.uefa),
    TeamSeedRow("croatia", "Хорватия", "Хорватия", "CRO", "🇭🇷", TeamConfederation.uefa),
    TeamSeedRow("czechia", "Чехия", "Чехия", "CZE", "🇨🇿", TeamConfederation.uefa),
    TeamSeedRow("england", "Англия", "Англия", "ENG", "🏴", TeamConfederation.uefa),
    TeamSeedRow("france", "Франция", "Франция", "FRA", "🇫🇷", TeamConfederation.uefa),
    TeamSeedRow("germany", "Германия", "Германия", "GER", "🇩🇪", TeamConfederation.uefa),
    TeamSeedRow("netherlands", "Нидерланды", "Нидерланды", "NED", "🇳🇱", TeamConfederation.uefa),
    TeamSeedRow("norway", "Норвегия", "Норвегия", "NOR", "🇳🇴", TeamConfederation.uefa),
    TeamSeedRow("portugal", "Португалия", "Португалия", "POR", "🇵🇹", TeamConfederation.uefa),
    TeamSeedRow("scotland", "Шотландия", "Шотландия", "SCO", "🏴", TeamConfederation.uefa),
    TeamSeedRow("spain", "Испания", "Испания", "ESP", "🇪🇸", TeamConfederation.uefa),
    TeamSeedRow("sweden", "Швеция", "Швеция", "SWE", "🇸🇪", TeamConfederation.uefa),
    TeamSeedRow("switzerland", "Швейцария", "Швейцария", "SUI", "🇨🇭", TeamConfederation.uefa),
    TeamSeedRow("turkiye", "Турция", "Турция", "TUR", "🇹🇷", TeamConfederation.uefa),
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
