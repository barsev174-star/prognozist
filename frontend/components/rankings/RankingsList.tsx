"use client";

import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, hasAccessToken, type RankingResponse } from "@/lib/api";

export function RankingsList() {
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    apiGet<RankingResponse>("/rankings/global")
      .then(setRanking)
      .catch(() => setError("Не удалось загрузить рейтинг."))
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

  if (!ranking || ranking.entries.length === 0) {
    return <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Рейтинг пока пуст.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Призы общего рейтинга</div>
        <div className="mt-2 text-sm text-muted">1 место - Telegram Premium</div>
        <div className="text-sm text-muted">2 место - VIP на 1 год</div>
        <div className="text-sm text-muted">3 место - VIP на 1 год</div>
      </section>

      <section className="rounded-lg bg-white shadow-sm">
        {ranking.entries.map((entry) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between border-b border-black/5 p-4 last:border-b-0 ${entry.is_current_user ? "bg-surface" : ""}`}
          >
            <div>
              <div className="text-sm font-semibold">
                #{entry.rank} {entry.first_name ?? entry.username ?? `user ${entry.telegram_id}`}
              </div>
              <div className="text-xs text-muted">telegram id {entry.telegram_id}</div>
            </div>
            <div className="text-sm font-semibold">{entry.points}</div>
          </div>
        ))}
      </section>

      {ranking.current_user_entry && !ranking.entries.some((entry) => entry.user_id === ranking.current_user_entry?.user_id) ? (
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <div className="text-sm text-muted">Ваша позиция</div>
          <div className="mt-1 text-sm font-semibold">
            #{ranking.current_user_entry.rank} · {ranking.current_user_entry.points} очков
          </div>
        </section>
      ) : null}
    </div>
  );
}

