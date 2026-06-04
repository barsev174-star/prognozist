"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, apiPost, hasAccessToken, type MatchDetail, type Prediction } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta, isPredictionLocked } from "@/lib/matchStatus";

type MatchPredictionFormProps = {
  matchId: number;
};

export function MatchPredictionForm({ matchId }: MatchPredictionFormProps) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [score1, setScore1] = useState("1");
  const [score2, setScore2] = useState("0");
  const [publicAnswer, setPublicAnswer] = useState("true");
  const [vipAnswer, setVipAnswer] = useState("true");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    Promise.all([
      apiGet<MatchDetail>(`/matches/${matchId}`),
      apiGet<Prediction | null>(`/predictions/${matchId}/mine`),
    ])
      .then(([matchRow, predictionRow]) => {
        setMatch(matchRow);
        setPrediction(predictionRow);
        if (predictionRow) {
          setScore1(String(predictionRow.predicted_team_1_score));
          setScore2(String(predictionRow.predicted_team_2_score));
        }
      })
      .catch(() => setStatusText("Не удалось загрузить матч."))
      .finally(() => setIsLoading(false));
  }, [matchId]);

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Загрузка...</div>;
  }

  if (!match) {
    return <div className="rounded-lg bg-white p-4 text-sm text-red-600 shadow-sm">{statusText ?? "Матч не найден."}</div>;
  }

  const status = getMatchStatusMeta(match);
  const isLocked = isPredictionLocked(match);
  const hasResult = match.team_1_score !== null && match.team_2_score !== null;

  async function savePrediction(event: React.FormEvent) {
    event.preventDefault();
    setStatusText(null);

    if (!match || isPredictionLocked(match)) {
      setStatusText("Внесение прогнозов закрыто.");
      return;
    }

    try {
      await apiPost<Prediction>("/predictions", {
        match_id: matchId,
        predicted_team_1_score: Number(score1),
        predicted_team_2_score: Number(score2),
      });

      if (match.public_question) {
        await apiPost(`/questions/${match.public_question.id}/answer`, {
          answer: publicAnswer === "true",
        });
      }

      if (match.vip_question && !match.vip_question_locked) {
        await apiPost(`/questions/vip/${match.vip_question.id}/answer`, {
          answer: vipAnswer === "true",
        });
      }

      const updated = await apiGet<Prediction | null>(`/predictions/${matchId}/mine`);
      setPrediction(updated);
      setStatusText("Прогноз сохранен.");
    } catch {
      setStatusText("Не удалось сохранить прогноз. Проверьте, что матч еще не начался.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <div className="text-lg font-semibold">
          {match.team_1} - {match.team_2}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>{formatMatchDate(match.start_time)}</span>
          <span className={`inline-flex items-center gap-1 ${status.textClassName}`}>
            <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
            {status.label}
          </span>
        </div>
        {hasResult ? (
          <div className="mt-3 rounded-md bg-surface px-3 py-2 text-sm">
            Итоговый счет: {match.team_1_score}:{match.team_2_score}
          </div>
        ) : null}
        {prediction ? (
          <div className="mt-3 rounded-md bg-surface px-3 py-2 text-sm">
            Ваш прогноз: {prediction.predicted_team_1_score}:{prediction.predicted_team_2_score}
            {match.status === "completed" ? `, очки: ${prediction.points_awarded}` : ""}
          </div>
        ) : isLocked ? (
          <div className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-muted">
            Прогноз не внесен. Внесение закрыто.
          </div>
        ) : null}
      </section>

      <form onSubmit={savePrediction} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">{isLocked ? "Прогноз" : "Точный счет"}</div>
        <div className="grid grid-cols-[1fr_64px_64px_1fr] items-center gap-2">
          <div className="text-sm">{match.team_1}</div>
          <input
            className="rounded-md border border-black/10 px-3 py-2 text-center disabled:bg-surface disabled:text-muted"
            disabled={isLocked}
            min={0}
            type="number"
            value={score1}
            onChange={(event) => setScore1(event.target.value)}
          />
          <input
            className="rounded-md border border-black/10 px-3 py-2 text-center disabled:bg-surface disabled:text-muted"
            disabled={isLocked}
            min={0}
            type="number"
            value={score2}
            onChange={(event) => setScore2(event.target.value)}
          />
          <div className="text-right text-sm">{match.team_2}</div>
        </div>

        {match.public_question ? (
          <label className="flex flex-col gap-2 text-sm">
            <span>{match.public_question.text}</span>
            <select
              className="rounded-md border border-black/10 px-3 py-2 disabled:bg-surface disabled:text-muted"
              disabled={isLocked}
              value={publicAnswer}
              onChange={(event) => setPublicAnswer(event.target.value)}
            >
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
        ) : (
          <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">Публичный вопрос не задан.</div>
        )}

        {match.vip_question_locked ? (
          <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
            VIP-вопрос доступен только с активной подпиской.
          </div>
        ) : match.vip_question ? (
          <label className="flex flex-col gap-2 text-sm">
            <span>{match.vip_question.text}</span>
            <select
              className="rounded-md border border-black/10 px-3 py-2 disabled:bg-surface disabled:text-muted"
              disabled={isLocked}
              value={vipAnswer}
              onChange={(event) => setVipAnswer(event.target.value)}
            >
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
        ) : null}

        {isLocked ? (
          <p className="text-sm text-muted">Матч уже начался или завершен. Внесение прогнозов закрыто.</p>
        ) : (
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
            Сохранить прогноз
          </button>
        )}
        {statusText ? <p className="text-sm text-muted">{statusText}</p> : null}
      </form>

      <Link className="text-sm text-muted" href="/matches">
        Назад к матчам
      </Link>
    </div>
  );
}
