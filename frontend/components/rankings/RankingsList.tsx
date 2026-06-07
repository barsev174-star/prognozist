"use client";

import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, hasAccessToken, type RankingResponse } from "@/lib/api";

const loadError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0440\u0435\u0439\u0442\u0438\u043d\u0433.";
const loadingLabel = "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";
const emptyLabel = "\u0420\u0435\u0439\u0442\u0438\u043d\u0433 \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442.";
const ladderTitle = "\u0411\u043e\u0440\u044c\u0431\u0430 \u0437\u0430 \u043e\u0431\u0449\u0438\u0439 \u0442\u043e\u043f";
const vipYearLabel = "VIP \u043d\u0430 1 \u0433\u043e\u0434";
const currentUserLabel = "\u0412\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435";
const yourPositionLabel = "\u0412\u0430\u0448\u0430 \u043f\u043e\u0437\u0438\u0446\u0438\u044f";
const pointsLabel = "\u043e\u0447\u043a\u043e\u0432";

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
      .catch(() => setError(loadError))
      .finally(() => setIsLoading(false));
  }, []);

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{loadingLabel}</div>;
  }

  if (error) {
    return <div className="rounded-[24px] border border-red-200 bg-white/90 p-4 text-sm text-red-600 shadow-sm">{error}</div>;
  }

  if (!ranking || ranking.entries.length === 0) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{emptyLabel}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#172033_0%,#103b35_100%)] p-5 text-white shadow-[0_18px_55px_rgba(23,32,51,0.18)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72">Global ladder</div>
        <h2 className="mt-2 text-2xl font-semibold">{ladderTitle}</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <PrizeCard place="1" prize="Telegram Premium" />
          <PrizeCard place="2" prize={vipYearLabel} />
          <PrizeCard place="3" prize={vipYearLabel} />
        </div>
      </section>

      <section className="rounded-[24px] border border-black/5 bg-white/92 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        {ranking.entries.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between border-b border-black/5 p-4 last:border-b-0 ${entry.is_current_user ? "bg-[rgba(15,118,110,0.07)]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={
                  index < 3
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#facc15)] text-sm font-semibold text-[#5b3a00]"
                    : "flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(23,32,51,0.06)] text-sm font-semibold text-muted"
                }
              >
                #{entry.rank}
              </div>
              <div>
                <div className="text-sm font-semibold">{entry.first_name ?? entry.username ?? `user ${entry.telegram_id}`}</div>
                <div className="mt-1 text-xs text-muted">{entry.is_current_user ? currentUserLabel : `telegram id ${entry.telegram_id}`}</div>
              </div>
            </div>
            <div className="rounded-full bg-[rgba(23,32,51,0.05)] px-3 py-1 text-sm font-semibold">{entry.points}</div>
          </div>
        ))}
      </section>

      {ranking.current_user_entry && !ranking.entries.some((entry) => entry.user_id === ranking.current_user_entry?.user_id) ? (
        <section className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{yourPositionLabel}</div>
          <div className="mt-2 text-lg font-semibold">
            #{ranking.current_user_entry.rank} {" \u00b7 "} {ranking.current_user_entry.points} {pointsLabel}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PrizeCard({ place, prize }: { place: string; prize: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3">
      <div className="text-xl font-semibold">{place}</div>
      <div className="mt-2 text-xs text-white/78">{prize}</div>
    </div>
  );
}
