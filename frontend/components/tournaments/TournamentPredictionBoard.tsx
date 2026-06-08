"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { TeamLogo } from "@/components/TeamLogo";
import {
  apiGet,
  apiPost,
  hasAccessToken,
  type Tournament,
  type TournamentPrediction,
  type TournamentPredictionQuestionWithUserPrediction,
} from "@/lib/api";

type TournamentPredictionBoardProps = {
  tournamentId: number;
};

const loadingLabel = "Загрузка турнирных прогнозов...";
const notFoundLabel = "Турнир не найден.";
const loadErrorLabel = "Не удалось загрузить турнирные прогнозы.";
const saveErrorLabel = "Не удалось сохранить ответ.";
const emptyLabel = "Для этого турнира пока нет открытых long-term вопросов.";
const backLabel = "← К турнирам";

export function TournamentPredictionBoard({ tournamentId }: TournamentPredictionBoardProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [questions, setQuestions] = useState<TournamentPredictionQuestionWithUserPrediction[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [statusText, setStatusText] = useState<string | null>(null);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const tournamentTitle = useMemo(() => tournament?.name ?? "Турнирные прогнозы", [tournament]);

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    Promise.all([
      apiGet<Tournament[]>("/tournaments"),
      apiGet<TournamentPredictionQuestionWithUserPrediction[]>(`/tournaments/${tournamentId}/prediction-questions/mine`),
    ])
      .then(([tournaments, questionRows]) => {
        setTournament(tournaments.find((item) => item.id === tournamentId) ?? null);
        setQuestions(questionRows);
        setAnswers(
          Object.fromEntries(
            questionRows.map((question) => [
              question.id,
              question.user_prediction?.selected_option_id ? String(question.user_prediction.selected_option_id) : "",
            ]),
          ),
        );
        setTextAnswers(
          Object.fromEntries(questionRows.map((question) => [question.id, question.user_prediction?.free_text ?? ""])),
        );
      })
      .catch(() => setStatusText(loadErrorLabel))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{loadingLabel}</div>;
  }

  if (!tournament) {
    return <div className="rounded-[24px] border border-red-200 bg-white/90 p-4 text-sm text-red-600 shadow-sm">{statusText ?? notFoundLabel}</div>;
  }

  async function saveAnswer(questionId: number) {
    const selectedValue = answers[questionId] ?? "";
    const textValue = (textAnswers[questionId] ?? "").trim();
    if (!selectedValue && !textValue) {
      setStatusText("Сначала выберите вариант или введите свой ответ.");
      return;
    }

    setSavingQuestionId(questionId);
    setStatusText(null);

    try {
      const prediction = await apiPost<TournamentPrediction>(`/tournaments/tournament-prediction-questions/${questionId}/answer`, {
        selected_option_id: selectedValue ? Number(selectedValue) : null,
        free_text: textValue || null,
      });
      setQuestions((current) =>
        current.map((question) =>
          question.id === questionId
            ? {
                ...question,
                user_prediction: prediction,
              }
            : question,
        ),
      );
      setStatusText("Ответ сохранен.");
    } catch {
      setStatusText(saveErrorLabel);
    } finally {
      setSavingQuestionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#103b35_0%,#172033_58%,#264653_100%)] p-5 text-white shadow-[0_18px_55px_rgba(23,32,51,0.18)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Долгий прогноз</div>
        <h1 className="mt-2 text-2xl font-semibold">{tournamentTitle}</h1>
        <p className="mt-3 text-sm text-white/78">
          Выбирайте исходы на весь турнир заранее. Ответ можно обновлять до дедлайна каждого вопроса.
        </p>
      </section>

      {questions.length === 0 ? (
        <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{emptyLabel}</div>
      ) : (
        questions.map((question) => {
          const isLocked = !isQuestionEditable(question);
          const savedOptionId = question.user_prediction?.selected_option_id ?? null;
          const savedText = question.user_prediction?.free_text ?? "";
          const resolvedOption = question.result?.correct_option_id
            ? question.options.find((option) => option.id === question.result?.correct_option_id) ?? null
            : null;

          return (
            <section key={question.id} className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{formatQuestionStatus(question.status)}</div>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{question.title}</h2>
                  {question.description ? <p className="mt-2 text-sm text-muted">{question.description}</p> : null}
                </div>
                <div className="rounded-full bg-[rgba(23,32,51,0.06)] px-3 py-1 text-xs font-semibold text-ink">+{question.points}</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full bg-[rgba(23,32,51,0.05)] px-3 py-1">{formatDeadline(question.lock_at)}</span>
                {savedOptionId ? <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">Ответ сохранен</span> : null}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === String(option.id);
                  const isCorrect = question.result?.correct_option_id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: String(option.id) }))}
                      className={
                        isSelected
                          ? "flex items-center gap-3 rounded-[22px] border border-emerald-300 bg-emerald-50 px-3 py-3 text-left"
                          : "flex items-center gap-3 rounded-[22px] border border-black/8 bg-[rgba(23,32,51,0.03)] px-3 py-3 text-left disabled:bg-surface disabled:text-muted"
                      }
                    >
                      <TeamLogo logo={option.team?.logo_url ?? option.team?.flag_emoji ?? null} name={option.label} size="sm" />
                      <span className="min-w-0 flex-1 text-sm font-medium text-ink">{option.label}</span>
                      {isCorrect ? <span className="text-xs font-semibold text-green-700">Верно</span> : null}
                    </button>
                  );
                })}
              </div>

              {question.options.length === 0 ? (
                <textarea
                  rows={3}
                  disabled={isLocked}
                  value={textAnswers[question.id] ?? ""}
                  onChange={(event) => setTextAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                  placeholder="Введите свой прогноз"
                  className="mt-4 w-full rounded-[22px] border border-black/10 bg-white px-3 py-3 text-sm text-ink disabled:bg-surface disabled:text-muted"
                />
              ) : null}

              {question.result ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(23,32,51,0.05)] px-3 py-3 text-sm text-muted">
                  Правильный ответ: {resolvedOption?.label ?? question.result.correct_text ?? "не указан"}
                </div>
              ) : null}

              {!savedOptionId && savedText ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(23,32,51,0.05)] px-3 py-3 text-sm text-muted">Ваш ответ: {savedText}</div>
              ) : null}

              {question.status === "resolved" && question.user_prediction ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(16,59,53,0.08)] px-3 py-3 text-sm text-ink">
                  {`Ваш результат: ${question.user_prediction.points_awarded ?? 0} ${formatPointsLabel(question.user_prediction.points_awarded ?? 0)}`}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isLocked || (!(answers[question.id] ?? "") && !(textAnswers[question.id] ?? "").trim()) || savingQuestionId === question.id}
                  onClick={() => saveAnswer(question.id)}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
                >
                  {savingQuestionId === question.id ? "Сохраняем..." : savedOptionId ? "Обновить ответ" : "Сохранить ответ"}
                </button>
                {isLocked ? <span className="text-sm text-muted">Дедлайн прошел или вопрос уже закрыт.</span> : null}
              </div>
            </section>
          );
        })
      )}

      {statusText ? <div className="rounded-[20px] bg-white/90 px-4 py-3 text-sm text-muted shadow-sm">{statusText}</div> : null}

      <Link className="text-sm font-medium text-muted" href="/tournaments">
        {backLabel}
      </Link>
    </div>
  );
}

function isQuestionEditable(question: TournamentPredictionQuestionWithUserPrediction): boolean {
  if (question.status !== "active") {
    return false;
  }
  if (!question.lock_at) {
    return true;
  }
  return new Date(question.lock_at).getTime() > Date.now();
}

function formatQuestionStatus(status: TournamentPredictionQuestionWithUserPrediction["status"]): string {
  switch (status) {
    case "active":
      return "Открыт";
    case "locked":
      return "Закрыт";
    case "resolved":
      return "Рассчитан";
    case "cancelled":
      return "Отменен";
    default:
      return "Черновик";
  }
}

function formatDeadline(value: string | null): string {
  if (!value) {
    return "Без дедлайна";
  }
  return `До ${new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))}`;
}

function formatPointsLabel(points: number): string {
  if (points % 10 === 1 && points % 100 !== 11) {
    return "балл";
  }
  if ([2, 3, 4].includes(points % 10) && ![12, 13, 14].includes(points % 100)) {
    return "балла";
  }
  return "баллов";
}
