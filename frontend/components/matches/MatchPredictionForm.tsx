"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { TeamLogo } from "@/components/TeamLogo";
import { apiGet, apiPost, hasAccessToken, type MatchDetail, type MatchPointsBreakdown, type Prediction } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta, isPredictionLocked } from "@/lib/matchStatus";

type MatchPredictionFormProps = {
  matchId: number;
};

const loadError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043c\u0430\u0442\u0447.";
const loadingLabel = "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";
const notFoundLabel = "\u041c\u0430\u0442\u0447 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.";
const lockedSubmitLabel = "\u0412\u043d\u0435\u0441\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u043e.";
const savedLabel = "\u041f\u0440\u043e\u0433\u043d\u043e\u0437 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.";
const saveErrorLabel =
  "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0440\u043e\u0433\u043d\u043e\u0437. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435, \u0447\u0442\u043e \u043c\u0430\u0442\u0447 \u0435\u0449\u0435 \u043d\u0435 \u043d\u0430\u0447\u0430\u043b\u0441\u044f.";
const finalScoreLabel = "\u0418\u0442\u043e\u0433\u043e\u0432\u044b\u0439 \u0441\u0447\u0435\u0442:";
const yourPredictionLabel = "\u0412\u0430\u0448 \u043f\u0440\u043e\u0433\u043d\u043e\u0437:";
const yourPointsLabel = "\u043e\u0447\u043a\u0438:";
const noPredictionLockedLabel = "\u041f\u0440\u043e\u0433\u043d\u043e\u0437 \u043d\u0435 \u0432\u043d\u0435\u0441\u0435\u043d. \u0412\u043d\u0435\u0441\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u043e.";
const breakdownTitle = "\u0420\u0430\u0437\u0431\u043e\u0440 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f \u043e\u0447\u043a\u043e\u0432";
const totalLabel = "\u0418\u0442\u043e\u0433\u043e:";
const yourAnswerLabel = "\u0412\u0430\u0448 \u043e\u0442\u0432\u0435\u0442:";
const unansweredLabel = "\u043d\u0435 \u043e\u0442\u0432\u0435\u0447\u0435\u043d\u043e";
const correctLabel = "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e:";
const unspecifiedLabel = "\u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u043e";
const matchClosedLabel = "\u041c\u0430\u0442\u0447 \u0437\u0430\u043a\u0440\u044b\u0442";
const yourForecastLabel = "\u0412\u0430\u0448 \u043f\u0440\u043e\u0433\u043d\u043e\u0437";
const fixedLabel = "\u0421\u0447\u0435\u0442 \u0438 \u043e\u0442\u0432\u0435\u0442\u044b \u0443\u0436\u0435 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u044b";
const quickQuestionsLabel = "\u0422\u043e\u0447\u043d\u044b\u0439 \u0441\u0447\u0435\u0442 \u0438 \u0431\u044b\u0441\u0442\u0440\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b";
const yesLabel = "\u0414\u0430";
const noLabel = "\u041d\u0435\u0442";
const noPublicQuestion = "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d.";
const vipOnlyLabel = "\u041e\u0442\u0432\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0442\u043e\u043b\u044c\u043a\u043e \u0441 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0439 VIP-\u043f\u043e\u0434\u043f\u0438\u0441\u043a\u043e\u0439.";
const closedText = "\u041c\u0430\u0442\u0447 \u0443\u0436\u0435 \u043d\u0430\u0447\u0430\u043b\u0441\u044f \u0438\u043b\u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d. \u0412\u043d\u0435\u0441\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u043e.";
const saveButtonLabel = "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0440\u043e\u0433\u043d\u043e\u0437";
const backToMatchesLabel = "\u2190 \u041d\u0430\u0437\u0430\u0434 \u043a \u043c\u0430\u0442\u0447\u0430\u043c";

export function MatchPredictionForm({ matchId }: MatchPredictionFormProps) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [pointsBreakdown, setPointsBreakdown] = useState<MatchPointsBreakdown | null>(null);
  const [score1, setScore1] = useState("1");
  const [score2, setScore2] = useState("0");
  const [publicAnswers, setPublicAnswers] = useState<Record<number, string>>({});
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

    Promise.all([apiGet<MatchDetail>(`/matches/${matchId}`), apiGet<Prediction | null>(`/predictions/${matchId}/mine`)])
      .then(([matchRow, predictionRow]) => {
        setMatch(matchRow);
        setPrediction(predictionRow);
        setPublicAnswers(
          Object.fromEntries(
            (matchRow.public_questions.length ? matchRow.public_questions : matchRow.public_question ? [matchRow.public_question] : []).map((question) => [
              question.id,
              "true",
            ]),
          ),
        );
        if (predictionRow) {
          setScore1(String(predictionRow.predicted_team_1_score));
          setScore2(String(predictionRow.predicted_team_2_score));
        }
        if (matchRow.status === "completed") {
          apiGet<MatchPointsBreakdown>(`/matches/${matchId}/points-breakdown`)
            .then(setPointsBreakdown)
            .catch(() => setPointsBreakdown(null));
        }
      })
      .catch(() => setStatusText(loadError))
      .finally(() => setIsLoading(false));
  }, [matchId]);

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{loadingLabel}</div>;
  }

  if (!match) {
    return <div className="rounded-[24px] border border-red-200 bg-white/90 p-4 text-sm text-red-600 shadow-sm">{statusText ?? notFoundLabel}</div>;
  }

  const status = getMatchStatusMeta(match);
  const isLocked = isPredictionLocked(match);
  const hasResult = match.team_1_score !== null && match.team_2_score !== null;

  async function savePrediction(event: React.FormEvent) {
    event.preventDefault();
    setStatusText(null);

    if (!match || isPredictionLocked(match)) {
      setStatusText(lockedSubmitLabel);
      return;
    }

    try {
      await apiPost<Prediction>("/predictions", {
        match_id: matchId,
        predicted_team_1_score: Number(score1),
        predicted_team_2_score: Number(score2),
      });

      const publicQuestions = match.public_questions.length ? match.public_questions : match.public_question ? [match.public_question] : [];
      for (const question of publicQuestions) {
        await apiPost(`/questions/${question.id}/answer`, {
          answer: (publicAnswers[question.id] ?? "true") === "true",
        });
      }

      if (match.vip_question && !match.vip_question_locked) {
        await apiPost(`/questions/vip/${match.vip_question.id}/answer`, {
          answer: vipAnswer === "true",
        });
      }

      const updated = await apiGet<Prediction | null>(`/predictions/${matchId}/mine`);
      setPrediction(updated);
      setStatusText(savedLabel);
    } catch {
      setStatusText(saveErrorLabel);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#103b35_0%,#172033_62%,#264653_100%)] p-5 text-white shadow-[0_18px_55px_rgba(23,32,51,0.18)]">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <TeamLogo logo={match.team_1_logo} name={match.team_1} size="lg" />
          <span className="min-w-0 flex-1 text-center">
            {match.team_1} - {match.team_2}
          </span>
          <TeamLogo logo={match.team_2_logo} name={match.team_2} size="lg" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/78">
          <span className="rounded-full bg-white/10 px-3 py-1">{formatMatchDate(match.start_time)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
            <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
            {status.label}
          </span>
        </div>
        {hasResult ? (
          <div className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium">
            {finalScoreLabel} {match.team_1_score}:{match.team_2_score}
          </div>
        ) : null}
        {prediction ? (
          <div className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-sm">
            {yourPredictionLabel} {prediction.predicted_team_1_score}:{prediction.predicted_team_2_score}
            {match.status === "completed" ? `, ${yourPointsLabel} ${prediction.points_awarded}` : ""}
          </div>
        ) : isLocked ? (
          <div className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/74">{noPredictionLockedLabel}</div>
        ) : null}
      </section>

      {hasResult && pointsBreakdown ? (
        <section className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{breakdownTitle}</h2>
            <span className="rounded-full bg-[rgba(23,32,51,0.06)] px-3 py-1 text-xs font-medium">
              {totalLabel} {pointsBreakdown.total_points}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {pointsBreakdown.items.map((item, index) => (
              <div key={`${item.type}-${index}`} className="rounded-2xl bg-[rgba(23,32,51,0.05)] px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{item.title}</div>
                  <div className={item.points_awarded > 0 ? "font-semibold text-green-700" : "font-semibold text-muted"}>
                    +{item.points_awarded}/{item.max_points}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {yourAnswerLabel} {item.user_answer ?? unansweredLabel} {" \u00b7 "} {correctLabel} {item.correct_answer ?? unspecifiedLabel}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <form onSubmit={savePrediction} className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{isLocked ? matchClosedLabel : yourForecastLabel}</div>
          <div className="mt-1 text-base font-semibold">{isLocked ? fixedLabel : quickQuestionsLabel}</div>
        </div>

        <div className="grid grid-cols-[1fr_68px_68px_1fr] items-center gap-2 rounded-[22px] bg-[rgba(23,32,51,0.04)] p-3">
          <div className="flex items-center gap-2 text-sm">
            <TeamLogo logo={match.team_1_logo} name={match.team_1} size="sm" />
            <span>{match.team_1}</span>
          </div>
          <input
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-center disabled:bg-surface disabled:text-muted"
            disabled={isLocked}
            min={0}
            type="number"
            value={score1}
            onChange={(event) => setScore1(event.target.value)}
          />
          <input
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-center disabled:bg-surface disabled:text-muted"
            disabled={isLocked}
            min={0}
            type="number"
            value={score2}
            onChange={(event) => setScore2(event.target.value)}
          />
          <div className="flex items-center justify-end gap-2 text-right text-sm">
            <span>{match.team_2}</span>
            <TeamLogo logo={match.team_2_logo} name={match.team_2} size="sm" />
          </div>
        </div>

        {(match.public_questions.length ? match.public_questions : match.public_question ? [match.public_question] : []).map((question) => (
          <label key={question.id} className="flex flex-col gap-2 rounded-[22px] bg-[rgba(23,32,51,0.04)] p-3 text-sm">
            <span className="font-medium">{question.text}</span>
            <span className="text-xs text-muted">+{question.points} {formatPointsLabel(question.points)}</span>
            <select
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 disabled:bg-surface disabled:text-muted"
              disabled={isLocked}
              value={publicAnswers[question.id] ?? "true"}
              onChange={(event) => setPublicAnswers({ ...publicAnswers, [question.id]: event.target.value })}
            >
              <option value="true">{yesLabel}</option>
              <option value="false">{noLabel}</option>
            </select>
          </label>
        ))}
        {match.public_questions.length === 0 && !match.public_question ? <div className="rounded-2xl bg-[rgba(23,32,51,0.04)] px-3 py-3 text-sm text-muted">{noPublicQuestion}</div> : null}

        {match.vip_question ? (
          <label className="flex flex-col gap-2 rounded-[22px] border border-[rgba(245,158,11,0.16)] bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(255,255,255,0.8))] p-3 text-sm">
            <span className="font-medium">{match.vip_question.text}</span>
            <span className="text-xs text-muted">+{match.vip_question.points} {formatPointsLabel(match.vip_question.points)}</span>
            <select
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 disabled:bg-surface disabled:text-muted"
              disabled={isLocked || match.vip_question_locked}
              value={vipAnswer}
              onChange={(event) => setVipAnswer(event.target.value)}
            >
              <option value="true">{yesLabel}</option>
              <option value="false">{noLabel}</option>
            </select>
            {match.vip_question_locked ? <span className="text-xs text-muted">{vipOnlyLabel}</span> : null}
          </label>
        ) : null}

        {isLocked ? <p className="text-sm text-muted">{closedText}</p> : <button className="rounded-full bg-ink px-4 py-3 text-sm font-medium text-white">{saveButtonLabel}</button>}
        {statusText ? <p className="text-sm text-muted">{statusText}</p> : null}
      </form>

      <Link className="text-sm font-medium text-muted" href="/matches">
        {backToMatchesLabel}
      </Link>
    </div>
  );
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
