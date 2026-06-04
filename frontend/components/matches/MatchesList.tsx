"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, hasAccessToken, type Match } from "@/lib/api";

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
    <div className="flex flex-col gap-3">
      {matches.map((match) => (
        <Link key={match.id} href={`/matches/${match.id}`} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                {match.team_1} - {match.team_2}
              </div>
              <div className="mt-1 text-xs text-muted">
                {new Date(match.start_time).toLocaleString("ru-RU")} · {match.status}
              </div>
            </div>
            <span className="rounded-md bg-surface px-2 py-1 text-xs">#{match.id}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

