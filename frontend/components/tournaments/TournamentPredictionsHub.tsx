"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet, type Tournament } from "@/lib/api";

const loadingLabel = "Загрузка турниров...";
const emptyLabel = "Пока нет активных турниров для долгосрочных прогнозов.";
const errorLabel = "Не удалось загрузить список турниров.";
const openLabel = "Открыть прогнозы";

export function TournamentPredictionsHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<Tournament[]>("/tournaments")
      .then(setTournaments)
      .catch(() => setStatusText(errorLabel))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{loadingLabel}</div>;
  }

  if (statusText) {
    return <div className="rounded-[24px] border border-red-200 bg-white/90 p-4 text-sm text-red-600 shadow-sm">{statusText}</div>;
  }

  if (tournaments.length === 0) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{emptyLabel}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {tournaments.map((tournament) => (
        <Link
          key={tournament.id}
          href={`/tournaments/${tournament.id}`}
          className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{formatTournamentStatus(tournament.status)}</div>
          <h2 className="mt-2 text-lg font-semibold text-ink">{tournament.name}</h2>
          {tournament.description ? <p className="mt-2 text-sm text-muted">{tournament.description}</p> : null}
          <div className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">{openLabel}</div>
        </Link>
      ))}
    </div>
  );
}

function formatTournamentStatus(status: string): string {
  switch (status) {
    case "upcoming":
      return "Скоро старт";
    case "active":
      return "Идет турнир";
    case "completed":
      return "Завершен";
    default:
      return status;
  }
}
