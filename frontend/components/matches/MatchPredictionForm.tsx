"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, apiPost, hasAccessToken, type MatchDetail, type Prediction } from "@/lib/api";

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
      apiGet<Prediction | null>(`/predictions/${matchId}/mine`)
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

  const isLocked = new Date(match.start_time).getTime() <= Date.now();

  async function savePrediction(event: React.FormEvent) {
    event.preventDefault();
    setStatusText(null);

    try {
      await apiPost<Prediction>("/predictions", {
        match_id: matchId,
        predicted_team_1_score: Number(score1),
        predicted_team_2_score: Number(score2)
      });

      if (match?.public_question) {
        await apiPost(`/questions/${match.public_question.id}/answer`, {
          answer: publicAnswer === "true"
        });
      }

      if (match?.vip_question && !match.vip_question_locked) {
        await apiPost(`/questions/vip/${match.vip_question.id}/answer`, {
          answer: vipAnswer === "true"
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
        <div className="mt-1 text-sm text-muted">
          {new Date(match.start_time).toLocaleString("ru-RU")} · {match.status}
        </div>
        {prediction ? (
          <div className="mt-3 rounded-md bg-surface px-3 py-2 text-sm">
            Ваш прогноз: {prediction.predicted_team_1_score}:{prediction.predicted_team_2_score}
          </div>
        ) : null}
      </section>

      <form onSubmit={savePrediction} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Точный счет</div>
        <div className="grid grid-cols-[1fr_64px_64px_1fr] items-center gap-2">
          <div className="text-sm">{match.team_1}</div>
          <input className="rounded-md border border-black/10 px-3 py-2 text-center" disabled={isLocked} min={0} type="number" value={score1} onChange={(event) => setScore1(event.target.value)} />
          <input className="rounded-md border border-black/10 px-3 py-2 text-center" disabled={isLocked} min={0} type="number" value={score2} onChange={(event) => setScore2(event.target.value)} />
          <div className="text-right text-sm">{match.team_2}</div>
        </div>

        {match.public_question ? (
          <label className="flex flex-col gap-2 text-sm">
            {match.public_question.text}
            <select className="rounded-md border border-black/10 px-3 py-2" disabled={isLocked} value={publicAnswer} onChange={(event) => setPublicAnswer(event.target.value)}>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
        ) : null}

        {match.vip_question_locked ? (
          <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">VIP-вопрос доступен только с активной подпиской.</div>
        ) : match.vip_question ? (
          <label className="flex flex-col gap-2 text-sm">
            {match.vip_question.text}
            <select className="rounded-md border border-black/10 px-3 py-2" disabled={isLocked} value={vipAnswer} onChange={(event) => setVipAnswer(event.target.value)}>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </label>
        ) : null}

        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={isLocked}>
          Сохранить прогноз
        </button>
        {isLocked ? <p className="text-sm text-muted">Матч уже начался, прогнозы закрыты.</p> : null}
        {statusText ? <p className="text-sm text-muted">{statusText}</p> : null}
      </form>

      <Link className="text-sm text-muted" href="/matches">
        Назад к матчам
      </Link>
    </div>
  );
}

