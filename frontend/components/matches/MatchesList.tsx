"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, hasAccessToken, type Match } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta, isMatchArchived } from "@/lib/matchStatus";

export function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    apiGet<Match[]>("/matches")
      .then(setMatches)
      .catch(() => setError("Не удалось загрузить матчи."))
      .finally(() => setIsLoading(false));
  }, []);

  const { activeMatches, archivedMatches } = useMemo(
    () => ({
      activeMatches: matches.filter((match) => !isMatchArchived(match)),
      archivedMatches: matches.filter(isMatchArchived),
    }),
    [matches],
  );

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Загрузка...</div>;
  }

  if (error) {
    return <div className="rounded-lg bg-white p-4 text-sm text-red-600 shadow-sm">{error}</div>;
  }

  if (matches.length === 0) {
    return <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Матчей пока нет.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <MatchSection
        title="Текущие и будущие"
        emptyText="Нет матчей, открытых для просмотра и прогнозов."
        matches={activeMatches}
      />
      <MatchSection title="Архив" emptyText="Завершенных матчей пока нет." matches={archivedMatches} subdued />
    </div>
  );
}

function MatchSection({
  title,
  emptyText,
  matches,
  subdued = false,
}: {
  title: string;
  emptyText: string;
  matches: Match[];
  subdued?: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {matches.length === 0 ? (
        <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">{emptyText}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} subdued={subdued} />
          ))}
        </div>
      )}
    </section>
  );
}

function MatchCard({ match, subdued }: { match: Match; subdued: boolean }) {
  const status = getMatchStatusMeta(match);

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`rounded-lg bg-white p-4 shadow-sm ${subdued ? "opacity-85" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {match.team_1} - {match.team_2}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>{formatMatchDate(match.start_time)}</span>
            <span className={`inline-flex items-center gap-1 ${status.textClassName}`}>
              <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
              {status.label}
            </span>
          </div>
          {match.status === "completed" && match.team_1_score !== null && match.team_2_score !== null ? (
            <div className="mt-2 text-xs text-muted">
              Итоговый счет: {match.team_1_score}:{match.team_2_score}
            </div>
          ) : null}
        </div>
        <span className="shrink-0 rounded-md bg-surface px-2 py-1 text-xs">#{match.id}</span>
      </div>
    </Link>
  );
}
