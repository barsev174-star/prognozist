"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { TeamLogo } from "@/components/TeamLogo";
import { apiGet, hasAccessToken, type Match } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta, isMatchArchived } from "@/lib/matchStatus";
import { getPendingMatchActionsCount } from "@/lib/pending";

const loadError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043c\u0430\u0442\u0447\u0438.";
const loadingLabel = "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";
const emptyMatchesLabel = "\u041c\u0430\u0442\u0447\u0435\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.";
const dayLabel = "\u0418\u0433\u0440\u043e\u0432\u043e\u0439 \u0434\u0435\u043d\u044c";
const dayTitle = "\u0412\u044b\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u043c\u0430\u0442\u0447\u0438 \u0434\u043e \u0441\u0442\u0430\u0440\u0442\u043e\u0432\u043e\u0433\u043e \u0441\u0432\u0438\u0441\u0442\u043a\u0430";
const dayBody =
  "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0441\u0447\u0435\u0442, \u0437\u0430\u0442\u0435\u043c \u043e\u0442\u0432\u0435\u0442\u044b \u043d\u0430 \u0432\u043e\u043f\u0440\u043e\u0441\u044b. VIP-\u0432\u043e\u043f\u0440\u043e\u0441\u044b \u043f\u0440\u0438\u043d\u0435\u0441\u0443\u0442 \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0431\u0443\u0441\u0442 \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435.";
const activeTitle = "\u0422\u0435\u043a\u0443\u0449\u0438\u0435 \u0438 \u0431\u0443\u0434\u0443\u0449\u0438\u0435";
const activeSubtitle = "\u041e\u0442\u043a\u0440\u044b\u0442\u044b \u0434\u043b\u044f \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432 \u0438 \u043e\u0442\u0432\u0435\u0442\u043e\u0432";
const activeEmpty = "\u041d\u0435\u0442 \u043c\u0430\u0442\u0447\u0435\u0439, \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0445 \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0438 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432.";
const archiveTitle = "\u0410\u0440\u0445\u0438\u0432";
const archiveSubtitle = "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u044b\u0435 \u0432\u0441\u0442\u0440\u0435\u0447\u0438 \u0438 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b";
const archiveEmpty = "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u044b\u0445 \u043c\u0430\u0442\u0447\u0435\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.";
const homeSideLabel = "\u0414\u043e\u043c\u0430\u0448\u043d\u044f\u044f \u043b\u0438\u043d\u0438\u044f";
const awaySideLabel = "\u0413\u043e\u0441\u0442\u0435\u0432\u0430\u044f \u043b\u0438\u043d\u0438\u044f";
const matchLabelPrefix = "\u041c\u0430\u0442\u0447 #";
const scoreLabel = "\u0418\u0442\u043e\u0433\u043e\u0432\u044b\u0439 \u0441\u0447\u0435\u0442:";
const predictionDone = "\u041f\u0440\u043e\u0433\u043d\u043e\u0437 \u0432\u043d\u0435\u0441\u0435\u043d";
const predictionMissing = "\u041f\u0440\u043e\u0433\u043d\u043e\u0437\u0430 \u043d\u0435\u0442";
const answersLabel = "\u041e\u0442\u0432\u0435\u0442\u044b:";
const vipAnswerDone = "VIP-\u043e\u0442\u0432\u0435\u0442 \u0435\u0441\u0442\u044c";
const vipAnswerMissing = "VIP \u0431\u0435\u0437 \u043e\u0442\u0432\u0435\u0442\u0430";
const noActionsLabel = "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442";

function byCompletionTimeDesc(left: Match, right: Match): number {
  return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
}

export function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [canAnswerVip, setCanAnswerVip] = useState(false);

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    apiGet<Match[]>("/matches")
      .then((rows) => {
        setMatches(rows);
        const premiumUntil = typeof window !== "undefined" ? sessionStorage.getItem("premium_until_hint") : null;
        if (premiumUntil) {
          setCanAnswerVip(new Date(premiumUntil).getTime() > Date.now());
        } else {
          setCanAnswerVip(false);
        }
      })
      .catch(() => setError(loadError))
      .finally(() => setIsLoading(false));
  }, []);

  const { activeMatches, archivedMatches } = useMemo(
    () => ({
      activeMatches: matches.filter((match) => !isMatchArchived(match)),
      archivedMatches: matches.filter(isMatchArchived).sort(byCompletionTimeDesc),
    }),
    [matches],
  );

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{loadingLabel}</div>;
  }

  if (error) {
    return <div className="rounded-[24px] border border-red-200 bg-white/90 p-4 text-sm text-red-600 shadow-sm">{error}</div>;
  }

  if (matches.length === 0) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{emptyMatchesLabel}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[26px] border border-black/5 bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(245,158,11,0.12))] p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{dayLabel}</div>
        <h2 className="mt-2 text-xl font-semibold">{dayTitle}</h2>
        <p className="mt-2 text-sm text-muted">{dayBody}</p>
        {activeMatches.filter((match) => getPendingMatchActionsCount(match, canAnswerVip) > 0).length > 0 ? (
          <div className="mt-4 inline-flex rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            {`NEW ${activeMatches.filter((match) => getPendingMatchActionsCount(match, canAnswerVip) > 0).length}`}
          </div>
        ) : null}
      </section>

      <MatchSection title={activeTitle} subtitle={activeSubtitle} emptyText={activeEmpty} matches={activeMatches} canAnswerVip={canAnswerVip} />
      <MatchSection title={archiveTitle} subtitle={archiveSubtitle} emptyText={archiveEmpty} matches={archivedMatches} subdued />
    </div>
  );
}

function MatchSection({
  title,
  subtitle,
  emptyText,
  matches,
  canAnswerVip = false,
  subdued = false,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  matches: Match[];
  canAnswerVip?: boolean;
  subdued?: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      {matches.length === 0 ? (
        <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{emptyText}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} subdued={subdued} canAnswerVip={canAnswerVip} />
          ))}
        </div>
      )}
    </section>
  );
}

function MatchCard({ match, subdued, canAnswerVip }: { match: Match; subdued: boolean; canAnswerVip: boolean }) {
  const status = getMatchStatusMeta(match);
  const pendingCount = subdued ? 0 : getPendingMatchActionsCount(match, canAnswerVip);

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`group rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)] transition-transform duration-200 hover:-translate-y-0.5 ${subdued ? "opacity-90" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-3">
                <TeamLogo logo={match.team_1_logo} name={match.team_1} size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight break-words">{match.team_1}</div>
                  <div className="mt-1 text-xs text-muted">{homeSideLabel}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center">
                <div className="rounded-full bg-[rgba(23,32,51,0.05)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">VS</div>
              </div>
              <div className="mt-3 flex min-w-0 items-center justify-end gap-3 text-right">
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight break-words">{match.team_2}</div>
                  <div className="mt-1 text-xs text-muted">{awaySideLabel}</div>
                </div>
                <TeamLogo logo={match.team_2_logo} name={match.team_2} size="md" />
              </div>
            </div>
            {pendingCount > 0 ? <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">NEW</span> : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full bg-[rgba(23,32,51,0.05)] px-3 py-1">{formatMatchDate(match.start_time)}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${status.textClassName} bg-[rgba(23,32,51,0.04)]`}>
              <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
              {status.label}
            </span>
            <span className="rounded-full bg-[rgba(23,32,51,0.05)] px-3 py-1">{matchLabelPrefix + match.id}</span>
          </div>

          {match.status === "completed" && match.team_1_score !== null && match.team_2_score !== null ? (
            <div className="mt-3 rounded-2xl bg-[rgba(23,32,51,0.05)] px-3 py-2 text-sm font-medium text-ink">
              {scoreLabel} {match.team_1_score}:{match.team_2_score}
            </div>
          ) : null}

          <PlayerMatchProgress match={match} />
          {pendingCount > 0 ? <div className="mt-3 text-xs font-medium text-red-600">{`\u0416\u0434\u0443\u0442 \u043e\u0442\u0432\u0435\u0442\u0430: ${pendingCount}`}</div> : null}
        </div>
      </div>
    </Link>
  );
}

function PlayerMatchProgress({ match }: { match: Match }) {
  const publicQuestionsCount = match.public_questions_count ?? 0;
  const publicAnswersCount = match.user_public_answers_count ?? 0;
  const hasAnyProgress =
    Boolean(match.user_prediction_submitted) || publicAnswersCount > 0 || Boolean(match.user_vip_answer_submitted);

  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs">
      <Pill active={Boolean(match.user_prediction_submitted)} activeLabel={predictionDone} inactiveLabel={predictionMissing} />
      {publicQuestionsCount > 0 ? (
        <span
          className={
            publicAnswersCount >= publicQuestionsCount
              ? "rounded-full bg-green-100 px-3 py-1 font-medium text-green-800"
              : "rounded-full bg-[rgba(23,32,51,0.06)] px-3 py-1 text-muted"
          }
        >
          {answersLabel} {publicAnswersCount}/{publicQuestionsCount}
        </span>
      ) : null}
      {match.vip_question_exists ? <Pill active={Boolean(match.user_vip_answer_submitted)} activeLabel={vipAnswerDone} inactiveLabel={vipAnswerMissing} /> : null}
      {!hasAnyProgress && publicQuestionsCount === 0 && !match.vip_question_exists ? (
        <span className="rounded-full bg-[rgba(23,32,51,0.06)] px-3 py-1 text-muted">{noActionsLabel}</span>
      ) : null}
    </div>
  );
}

function Pill({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span className={active ? "rounded-full bg-green-100 px-3 py-1 font-medium text-green-800" : "rounded-full bg-[rgba(23,32,51,0.06)] px-3 py-1 text-muted"}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
