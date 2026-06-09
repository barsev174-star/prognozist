"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet, type Tournament, type TournamentPredictionPendingSummary } from "@/lib/api";
import { getPendingTournamentQuestionsCount } from "@/lib/pending";

const loadingLabel = "Загрузка турниров...";
const emptyLabel = "Пока нет активных турниров для долгосрочных прогнозов.";
const errorLabel = "Не удалось загрузить список турниров.";
const openLabel = "Открыть прогнозы";

export function TournamentPredictionsHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [pendingSummary, setPendingSummary] = useState<Record<number, number>>({});
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<Tournament[]>("/tournaments"),
      apiGet<TournamentPredictionPendingSummary[]>("/tournaments/mine/pending-summary"),
    ])
      .then(([tournamentRows, pendingRows]) => {
        setTournaments(tournamentRows);
        setPendingSummary(Object.fromEntries(pendingRows.map((row) => [row.tournament_id, row.pending_questions_count])));
      })
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
      {getPendingTournamentQuestionsCount(
        Object.entries(pendingSummary).map(([tournamentId, pendingCount]) => ({
          tournament_id: Number(tournamentId),
          pending_questions_count: pendingCount,
          total_questions_count: pendingCount,
        })),
      ) > 0 ? (
        <section className="rounded-[24px] border border-red-200 bg-[rgba(254,242,242,0.95)] p-4 shadow-sm">
          <div className="inline-flex rounded-full bg-red-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">New</div>
          <p className="mt-3 text-sm text-red-700">
            {`\u0411\u0435\u0437 \u043e\u0442\u0432\u0435\u0442\u0430 \u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c ${getPendingTournamentQuestionsCount(
              Object.entries(pendingSummary).map(([tournamentId, pendingCount]) => ({
                tournament_id: Number(tournamentId),
                pending_questions_count: pendingCount,
                total_questions_count: pendingCount,
              })),
            )} \u0442\u0443\u0440\u043d\u0438\u0440\u043d\u044b\u0445 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432.`}
          </p>
        </section>
      ) : null}
      {tournaments.map((tournament) => (
        <Link
          key={tournament.id}
          href={`/tournaments/${tournament.id}`}
          className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{formatTournamentStatus(tournament.status)}</div>
            {(pendingSummary[tournament.id] ?? 0) > 0 ? (
              <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                {(pendingSummary[tournament.id] ?? 0) > 9 ? "9+" : pendingSummary[tournament.id]}
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-ink">{tournament.name}</h2>
          {tournament.description ? <p className="mt-2 text-sm text-muted">{tournament.description}</p> : null}
          {(pendingSummary[tournament.id] ?? 0) > 0 ? <p className="mt-3 text-sm font-medium text-red-600">{`\u0416\u0434\u0443\u0442 \u043e\u0442\u0432\u0435\u0442\u0430: ${pendingSummary[tournament.id]}`}</p> : null}
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
