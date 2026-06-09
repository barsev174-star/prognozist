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

const text = {
  loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0442\u0443\u0440\u043d\u0438\u0440\u043d\u044b\u0445 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432...",
  notFound: "\u0422\u0443\u0440\u043d\u0438\u0440 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.",
  loadError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0442\u0443\u0440\u043d\u0438\u0440\u043d\u044b\u0435 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u044b.",
  saveError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043e\u0442\u0432\u0435\u0442.",
  empty: "\u0414\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u0442\u0443\u0440\u043d\u0438\u0440\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0445 \u0434\u043e\u043b\u0433\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0445 \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432.",
  back: "\u2190 \u041a \u0442\u0443\u0440\u043d\u0438\u0440\u0430\u043c",
  defaultTitle: "\u0422\u0443\u0440\u043d\u0438\u0440\u043d\u044b\u0435 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u044b",
  chooseFirst: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0430\u0440\u0438\u0430\u043d\u0442 \u0438\u043b\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043e\u0439 \u043e\u0442\u0432\u0435\u0442.",
  saved: "\u041e\u0442\u0432\u0435\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.",
  longTerm: "\u0414\u043e\u043b\u0433\u0438\u0439 \u043f\u0440\u043e\u0433\u043d\u043e\u0437",
  heroBody:
    "\u0412\u044b\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u0438\u0441\u0445\u043e\u0434\u044b \u043d\u0430 \u0432\u0435\u0441\u044c \u0442\u0443\u0440\u043d\u0438\u0440 \u0437\u0430\u0440\u0430\u043d\u0435\u0435. \u041e\u0442\u0432\u0435\u0442 \u043c\u043e\u0436\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u044f\u0442\u044c \u0434\u043e \u0434\u0435\u0434\u043b\u0430\u0439\u043d\u0430 \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u0432\u043e\u043f\u0440\u043e\u0441\u0430.",
  savedBadge: "\u041e\u0442\u0432\u0435\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d",
  correct: "\u0412\u0435\u0440\u043d\u043e",
  placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043e\u0439 \u043f\u0440\u043e\u0433\u043d\u043e\u0437",
  correctAnswer: "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0432\u0435\u0442:",
  notSpecified: "\u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d",
  yourAnswer: "\u0412\u0430\u0448 \u043e\u0442\u0432\u0435\u0442:",
  yourResult: "\u0412\u0430\u0448 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442:",
  saving: "\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u043c...",
  update: "\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043e\u0442\u0432\u0435\u0442",
  save: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043e\u0442\u0432\u0435\u0442",
  lockedHint: "\u0414\u0435\u0434\u043b\u0430\u0439\u043d \u043f\u0440\u043e\u0448\u0435\u043b \u0438\u043b\u0438 \u0432\u043e\u043f\u0440\u043e\u0441 \u0443\u0436\u0435 \u0437\u0430\u043a\u0440\u044b\u0442.",
  active: "\u041e\u0442\u043a\u0440\u044b\u0442",
  locked: "\u0417\u0430\u043a\u0440\u044b\u0442",
  resolved: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d",
  cancelled: "\u041e\u0442\u043c\u0435\u043d\u0435\u043d",
  draft: "\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a",
  noDeadline: "\u0411\u0435\u0437 \u0434\u0435\u0434\u043b\u0430\u0439\u043d\u0430",
  until: "\u0414\u043e",
};

export function TournamentPredictionBoard({ tournamentId }: TournamentPredictionBoardProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [questions, setQuestions] = useState<TournamentPredictionQuestionWithUserPrediction[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [statusText, setStatusText] = useState<string | null>(null);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const tournamentTitle = useMemo(() => tournament?.name ?? text.defaultTitle, [tournament]);

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
        setTextAnswers(Object.fromEntries(questionRows.map((question) => [question.id, question.user_prediction?.free_text ?? ""])));
      })
      .catch(() => setStatusText(text.loadError))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{text.loading}</div>;
  }

  if (!tournament) {
    return <div className="rounded-[24px] border border-red-200 bg-white/90 p-4 text-sm text-red-600 shadow-sm">{statusText ?? text.notFound}</div>;
  }

  async function saveAnswer(questionId: number) {
    const selectedValue = answers[questionId] ?? "";
    const textValue = (textAnswers[questionId] ?? "").trim();
    if (!selectedValue && !textValue) {
      setStatusText(text.chooseFirst);
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
      setStatusText(text.saved);
    } catch {
      setStatusText(text.saveError);
    } finally {
      setSavingQuestionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#103b35_0%,#172033_58%,#264653_100%)] p-5 text-white shadow-[0_18px_55px_rgba(23,32,51,0.18)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">{text.longTerm}</div>
        <h1 className="mt-2 text-2xl font-semibold">{tournamentTitle}</h1>
        <p className="mt-3 text-sm text-white/78">{text.heroBody}</p>
      </section>

      {questions.length === 0 ? (
        <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{text.empty}</div>
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
                {savedOptionId || savedText ? <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">{text.savedBadge}</span> : null}
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
                      {isCorrect ? <span className="text-xs font-semibold text-green-700">{text.correct}</span> : null}
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
                  placeholder={text.placeholder}
                  className="mt-4 w-full rounded-[22px] border border-black/10 bg-white px-3 py-3 text-sm text-ink disabled:bg-surface disabled:text-muted"
                />
              ) : null}

              {question.result ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(23,32,51,0.05)] px-3 py-3 text-sm text-muted">
                  {text.correctAnswer} {resolvedOption?.label ?? question.result.correct_text ?? text.notSpecified}
                </div>
              ) : null}

              {!savedOptionId && savedText ? <div className="mt-3 rounded-[20px] bg-[rgba(23,32,51,0.05)] px-3 py-3 text-sm text-muted">{text.yourAnswer} {savedText}</div> : null}

              {question.status === "resolved" && question.user_prediction ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(16,59,53,0.08)] px-3 py-3 text-sm text-ink">
                  {`${text.yourResult} ${question.user_prediction.points_awarded ?? 0} ${formatPointsLabel(question.user_prediction.points_awarded ?? 0)}`}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isLocked || (!(answers[question.id] ?? "") && !(textAnswers[question.id] ?? "").trim()) || savingQuestionId === question.id}
                  onClick={() => saveAnswer(question.id)}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
                >
                  {savingQuestionId === question.id ? text.saving : savedOptionId || savedText ? text.update : text.save}
                </button>
                {isLocked ? <span className="text-sm text-muted">{text.lockedHint}</span> : null}
              </div>
            </section>
          );
        })
      )}

      {statusText ? <div className="rounded-[20px] bg-white/90 px-4 py-3 text-sm text-muted shadow-sm">{statusText}</div> : null}

      <Link className="text-sm font-medium text-muted" href="/tournaments">
        {text.back}
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
      return text.active;
    case "locked":
      return text.locked;
    case "resolved":
      return text.resolved;
    case "cancelled":
      return text.cancelled;
    default:
      return text.draft;
  }
}

function formatDeadline(value: string | null): string {
  if (!value) {
    return text.noDeadline;
  }
  return `${text.until} ${new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))}`;
}

function formatPointsLabel(points: number): string {
  if (points % 10 === 1 && points % 100 !== 11) {
    return "\u0431\u0430\u043b\u043b";
  }
  if ([2, 3, 4].includes(points % 10) && ![12, 13, 14].includes(points % 100)) {
    return "\u0431\u0430\u043b\u043b\u0430";
  }
  return "\u0431\u0430\u043b\u043b\u043e\u0432";
}
