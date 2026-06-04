import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    ExpertPrediction,
    League,
    LeagueResult,
    Match,
    Prediction,
    Question,
    TournamentResult,
    VipQuestion,
)


def format_bool(value: bool | None) -> str:
    if value is None:
        return "не указано"
    return "Да" if value else "Нет"


def format_expert_prediction_post(match: Match, expert: ExpertPrediction, question: Question | None, vip_question: VipQuestion | None) -> str:
    return "\n".join(
        [
            f"Матч: {match.team_1} - {match.team_2}",
            "",
            "Прогноз эксперта:",
            f"{match.team_1} {expert.predicted_team_1_score}:{expert.predicted_team_2_score} {match.team_2}",
            "",
            f"Общий вопрос: {question.text if question else 'не указан'}",
            f"Ответ эксперта: {format_bool(expert.question_answer)}",
            "",
            f"VIP вопрос: {vip_question.text if vip_question else 'не указан'}",
            f"Ответ эксперта: {format_bool(expert.vip_question_answer)}",
        ]
    )


def format_match_result_post(db: Session, match: Match, expert: ExpertPrediction | None) -> str:
    exact_count = db.scalar(
        select(func.count()).select_from(Prediction).where(
            Prediction.match_id == match.id,
            Prediction.is_exact_score.is_(True),
        )
    ) or 0
    outcome_count = db.scalar(
        select(func.count()).select_from(Prediction).where(
            Prediction.match_id == match.id,
            Prediction.is_outcome_correct.is_(True),
            Prediction.is_exact_score.is_(False),
        )
    ) or 0
    avg_scores = db.execute(
        select(
            func.avg(Prediction.predicted_team_1_score),
            func.avg(Prediction.predicted_team_2_score),
        ).where(Prediction.match_id == match.id)
    ).one()
    question = db.scalar(select(Question).where(Question.match_id == match.id))
    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))

    expert_score = (
        f"{expert.predicted_team_1_score}:{expert.predicted_team_2_score}"
        if expert is not None
        else "не указан"
    )
    average_prediction = (
        f"{float(avg_scores[0]):.1f}:{float(avg_scores[1]):.1f}"
        if avg_scores[0] is not None and avg_scores[1] is not None
        else "нет прогнозов"
    )

    return "\n".join(
        [
            f"Итог матча: {match.team_1} {match.team_1_score}:{match.team_2_score} {match.team_2}",
            "",
            f"Прогноз эксперта: {expert_score}",
            f"Результат общего вопроса: {format_bool(question.correct_answer if question else None)}",
            f"Результат VIP вопроса: {format_bool(vip_question.correct_answer if vip_question else None)}",
            "",
            f"Угадали точный счет: {exact_count}",
            f"Угадали исход: {outcome_count}",
            f"Средний прогноз пользователей: {average_prediction}",
            f"Сравнение аудитории и эксперта: эксперт {expert_score}, аудитория {average_prediction}",
        ]
    )


def format_tournament_result_post(db: Session, tournament_id: int) -> str:
    results = db.scalars(
        select(TournamentResult)
        .where(TournamentResult.tournament_id == tournament_id)
        .order_by(TournamentResult.final_rank.asc())
        .limit(10)
    ).all()
    lines = ["Турнир завершен", "", "ТОП-10:"]
    for result in results:
        lines.append(f"{result.final_rank}. user_id={result.user_id} - {result.final_points} очков")
    lines.extend(["", "Призы:", "1 место - Telegram Premium", "2 место - VIP на 1 год", "3 место - VIP на 1 год"])
    return "\n".join(lines)


def format_league_result_post(db: Session, league: League) -> str:
    winner = db.scalar(
        select(LeagueResult)
        .where(LeagueResult.league_id == league.id)
        .order_by(LeagueResult.final_rank.asc())
        .limit(1)
    )
    if winner is None:
        winner_text = "нет участников с очками"
        points_text = "0"
    else:
        winner_text = f"user_id={winner.user_id}"
        points_text = str(winner.final_points)

    return "\n".join(
        [
            f"Лига: {league.name}",
            "",
            f"Победитель: {winner_text}",
            f"Очки: {points_text}",
            f"Приз: {league.prize_description or 'не указан'}",
            "",
            "Напоминание: данный приз был указан создателем лиги при создании соревнования.",
        ]
    )


async def publish_to_vip_channel(text: str) -> None:
    if not settings.bot_internal_token:
        return

    try:
        async with httpx.AsyncClient(base_url=settings.bot_internal_url, timeout=10) as client:
            response = await client.post(
                "/internal/publish/vip",
                headers={"X-Bot-Internal-Token": settings.bot_internal_token},
                json={"text": text},
            )
            response.raise_for_status()
    except httpx.HTTPError:
        return
