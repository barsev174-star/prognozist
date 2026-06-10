import asyncio
from dataclasses import dataclass, field
from datetime import UTC, datetime

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    ExpertPostPublishSource,
    ExpertPrediction,
    League,
    LeagueResult,
    Match,
    MatchStatus,
    Prediction,
    Question,
    QuestionAnswer,
    TournamentResult,
    VipQuestion,
    VipQuestionAnswer,
)


@dataclass
class VipChannelPublishResult:
    ok: bool
    detail: str


@dataclass
class DueExpertPostPublishResult:
    checked: int
    published: int
    failed: int
    published_items: list[dict[str, int]] = field(default_factory=list)
    failed_items: list[dict[str, int | str]] = field(default_factory=list)
def format_bool(value: bool | None) -> str:
    if value is None:
        return "не указан"
    return "Да" if value else "Нет"


def format_score(score_1: int | None, score_2: int | None) -> str:
    if score_1 is None or score_2 is None:
        return "не указан"
    return f"{score_1}:{score_2}"


def format_rounded_score(score_1: float | None, score_2: float | None) -> str:
    if score_1 is None or score_2 is None:
        return "нет прогнозов"
    return f"{int(score_1 + 0.5)}:{int(score_2 + 0.5)}"


def format_percentage(correct: int, total: int) -> str:
    if total <= 0:
        return "0%"
    return f"{round((correct / total) * 100)}%"


def build_question_result_line(
    *,
    title: str,
    text: str,
    correct_answer: bool | None,
    correct_count: int,
    total_count: int,
) -> str:
    return (
        f"{title}: {text}\n"
        f"Правильный ответ: {format_bool(correct_answer)}\n"
        f"Угадали: {correct_count} из {total_count} ({format_percentage(correct_count, total_count)})"
    )


def format_expert_prediction_post(
    match: Match,
    expert: ExpertPrediction,
    questions: list[Question],
    vip_question: VipQuestion | None,
) -> str:
    lines = [
        f"VIP-разбор к матчу {match.team_1} - {match.team_2}",
        "",
        "Прием прогнозов уже закрыт. Теперь можно свериться с мнением эксперта и обсудить матч до стартового свистка.",
        "",
        "Прогноз по счету:",
        f"{match.team_1} {expert.predicted_team_1_score}:{expert.predicted_team_2_score} {match.team_2}",
        "",
    ]

    public_answer_by_slot = {
        1: expert.question_answer,
        2: expert.question_2_answer,
    }
    for question in questions:
        lines.extend(
            [
                f"Вопрос {question.slot}: {question.text}",
                f"Ответ эксперта: {format_bool(public_answer_by_slot.get(question.slot or 1))}",
                "",
            ]
        )

    lines.extend(
        [
            f"VIP-вопрос: {vip_question.text if vip_question else 'не указан'}",
            f"Ответ эксперта: {format_bool(expert.vip_question_answer)}",
            "",
            "После финального свистка сравним этот прогноз с реальным итогом матча и посмотрим, как сыграла аудитория.",
        ]
    )
    return "\n".join(lines)


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
    questions = db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc())).all()
    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))

    expert_score = format_score(expert.predicted_team_1_score, expert.predicted_team_2_score) if expert is not None else "не указан"
    average_prediction = format_rounded_score(avg_scores[0], avg_scores[1])

    answer_lines: list[str] = []
    for question in questions:
        correct_count = db.scalar(
            select(func.count()).select_from(QuestionAnswer).where(
                QuestionAnswer.question_id == question.id,
                QuestionAnswer.is_correct.is_(True),
            )
        ) or 0
        total_count = db.scalar(
            select(func.count()).select_from(QuestionAnswer).where(
                QuestionAnswer.question_id == question.id,
            )
        ) or 0
        answer_lines.append(
            build_question_result_line(
                title=f"Вопрос {question.slot}",
                text=question.text,
                correct_answer=question.correct_answer,
                correct_count=correct_count,
                total_count=total_count,
            )
        )

    if vip_question is not None:
        vip_correct_count = db.scalar(
            select(func.count()).select_from(VipQuestionAnswer).where(
                VipQuestionAnswer.vip_question_id == vip_question.id,
                VipQuestionAnswer.is_correct.is_(True),
            )
        ) or 0
        vip_total_count = db.scalar(
            select(func.count()).select_from(VipQuestionAnswer).where(
                VipQuestionAnswer.vip_question_id == vip_question.id,
            )
        ) or 0
        answer_lines.append(
            build_question_result_line(
                title="VIP-вопрос",
                text=vip_question.text,
                correct_answer=vip_question.correct_answer,
                correct_count=vip_correct_count,
                total_count=vip_total_count,
            )
        )

    return "\n\n".join(
        [
            f"Матч завершен: {match.team_1} {match.team_1_score}:{match.team_2_score} {match.team_2}",
            "Финальный разбор:",
            f"Эксперт давал счет {expert_score}",
            f"Средний прогноз игроков: {average_prediction}",
            "\n\n".join(answer_lines) if answer_lines else "Ответов по вопросам пока нет.",
            f"Точный счет угадали: {exact_count}",
            f"Исход матча угадали: {outcome_count}",
            f"Сравнение эксперта и аудитории: эксперт {expert_score}, игроки в среднем {average_prediction}",
        ]
    )


def format_tournament_result_post(db: Session, tournament_id: int) -> str:
    results = db.scalars(
        select(TournamentResult)
        .where(TournamentResult.tournament_id == tournament_id)
        .order_by(TournamentResult.final_rank.asc())
        .limit(10)
    ).all()
    lines = ["Турнир завершен", "", "Топ-10:"]
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
            "Напоминание: этот приз был указан создателем лиги при создании соревнования.",
        ]
    )


async def publish_to_vip_channel(text: str) -> VipChannelPublishResult:
    if not settings.bot_internal_token:
        return VipChannelPublishResult(ok=False, detail="Bot internal token is not configured")

    try:
        async with httpx.AsyncClient(base_url=settings.bot_internal_url, timeout=10) as client:
            response = await client.post(
                "/internal/publish/vip",
                headers={"X-Bot-Internal-Token": settings.bot_internal_token},
                json={"text": text},
            )
            if response.is_success:
                return VipChannelPublishResult(ok=True, detail="Published")

            detail = "VIP channel publish failed"
            try:
                payload = response.json()
                if isinstance(payload, dict) and isinstance(payload.get("detail"), str):
                    detail = payload["detail"]
            except ValueError:
                pass
            return VipChannelPublishResult(ok=False, detail=detail)
    except httpx.HTTPError:
        return VipChannelPublishResult(ok=False, detail="VIP channel is unavailable")

def publish_expert_prediction_post(
    db: Session,
    expert: ExpertPrediction,
    *,
    source: ExpertPostPublishSource,
    published_at: datetime | None = None,
) -> VipChannelPublishResult:
    return asyncio.run(
        publish_expert_prediction_post_async(
            db,
            expert,
            source=source,
            published_at=published_at,
        )
    )


async def publish_expert_prediction_post_async(
    db: Session,
    expert: ExpertPrediction,
    *,
    source: ExpertPostPublishSource,
    published_at: datetime | None = None,
) -> VipChannelPublishResult:
    if expert.is_published:
        return VipChannelPublishResult(ok=False, detail="Expert prediction is already published")

    match = db.get(Match, expert.match_id)
    if match is None:
        return VipChannelPublishResult(ok=False, detail="Match not found")

    questions = list(db.scalars(select(Question).where(Question.match_id == match.id).order_by(Question.slot.asc(), Question.id.asc())))
    vip_question = db.scalar(select(VipQuestion).where(VipQuestion.match_id == match.id))
    publish_result = await publish_to_vip_channel(format_expert_prediction_post(match, expert, questions, vip_question))
    if not publish_result.ok:
        return publish_result

    expert.is_published = True
    expert.published_at = published_at or datetime.now(UTC)
    expert.publish_source = source
    db.flush()
    return VipChannelPublishResult(ok=True, detail="Published")


def publish_due_expert_predictions(
    db: Session,
    *,
    now: datetime | None = None,
) -> DueExpertPostPublishResult:
    return asyncio.run(publish_due_expert_predictions_async(db, now=now))


async def publish_due_expert_predictions_async(
    db: Session,
    *,
    now: datetime | None = None,
) -> DueExpertPostPublishResult:
    current_time = now or datetime.now(UTC)
    experts = list(
        db.scalars(
            select(ExpertPrediction)
            .join(Match, Match.id == ExpertPrediction.match_id)
            .where(
                ExpertPrediction.is_published.is_(False),
                Match.start_time <= current_time,
                Match.status != MatchStatus.completed,
            )
            .order_by(Match.start_time.asc(), ExpertPrediction.id.asc())
        )
    )

    published = 0
    failed = 0
    published_items: list[dict[str, int]] = []
    failed_items: list[dict[str, int | str]] = []

    for expert in experts:
        match = db.get(Match, expert.match_id)
        result = await publish_expert_prediction_post_async(
            db,
            expert,
            source=ExpertPostPublishSource.automatic,
            published_at=current_time,
        )
        if result.ok:
            published += 1
            published_items.append(
                {
                    "expert_prediction_id": expert.id,
                    "match_id": expert.match_id,
                }
            )
        else:
            failed += 1
            failed_items.append(
                {
                    "expert_prediction_id": expert.id,
                    "match_id": expert.match_id,
                    "detail": result.detail,
                    "start_time": match.start_time.isoformat() if match is not None else "",
                }
            )

    return DueExpertPostPublishResult(
        checked=len(experts),
        published=published,
        failed=failed,
        published_items=published_items,
        failed_items=failed_items,
    )

