"use client";

import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, apiPatch, apiPost, hasAccessToken, type League, type RankingEntry, type Tournament } from "@/lib/api";

const loadError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043b\u0438\u0433\u0438.";
const createSuccess = "\u041b\u0438\u0433\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0430.";
const createError =
  "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u043b\u0438\u0433\u0443. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0442\u0443\u0440\u043d\u0438\u0440 \u0438 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435.";
const joinSuccess = "\u0412\u044b \u0432\u0441\u0442\u0443\u043f\u0438\u043b\u0438 \u0432 \u043b\u0438\u0433\u0443.";
const joinError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u0441\u0442\u0443\u043f\u0438\u0442\u044c \u0432 \u043b\u0438\u0433\u0443. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043a\u043e\u0434 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f.";
const prizeUpdated = "\u041f\u0440\u0438\u0437 \u043b\u0438\u0433\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d.";
const prizeError =
  "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043f\u0440\u0438\u0437. \u041c\u0435\u043d\u044f\u0442\u044c \u0435\u0433\u043e \u043c\u043e\u0436\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u0432\u043b\u0430\u0434\u0435\u043b\u0435\u0446 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0439 \u043b\u0438\u0433\u0438.";
const loadingLabel = "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";
const heroEyebrow = "\u041a\u043b\u0443\u0431\u044b \u0438\u0433\u0440\u043e\u043a\u043e\u0432";
const heroTitle = "\u0421\u043e\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u0441\u0432\u043e\u044e \u043b\u0438\u0433\u0443";
const heroBody = "\u041b\u0438\u0447\u043d\u044b\u0435 \u043b\u0438\u0433\u0438 \u043f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 \u0438\u0433\u0440\u0430\u0442\u044c \u0432 \u0441\u0432\u043e\u0435\u043c \u043a\u0440\u0443\u0433\u0443, \u0441\u0440\u0430\u0432\u043d\u0438\u0432\u0430\u0442\u044c \u043e\u0447\u043a\u0438 \u0438 \u0434\u043e\u0431\u0430\u0432\u043b\u044f\u0442\u044c \u0441\u0432\u043e\u0438 \u043f\u0440\u0438\u0437\u044b.";
const createTitle = "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043b\u0438\u0433\u0443";
const tournamentLabel = "\u0422\u0443\u0440\u043d\u0438\u0440";
const leagueNamePlaceholder = "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043b\u0438\u0433\u0438";
const descriptionPlaceholder = "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435";
const prizePlaceholder = "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0440\u0438\u0437 \u0438\u043b\u0438 \u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043f\u043e\u043b\u0435 \u043f\u0443\u0441\u0442\u044b\u043c";
const createButton = "\u0421\u043e\u0437\u0434\u0430\u0442\u044c";
const joinTitle = "\u0412\u0441\u0442\u0443\u043f\u0438\u0442\u044c \u043f\u043e \u043a\u043e\u0434\u0443";
const invitePlaceholder = "\u041a\u043e\u0434 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f";
const joinButton = "\u0412\u0441\u0442\u0443\u043f\u0438\u0442\u044c";
const yourLeaguesTitle = "\u0412\u0430\u0448\u0438 \u043b\u0438\u0433\u0438";
const noLeaguesLabel = "\u041b\u0438\u0433 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.";
const membersLabel = "\u0438\u0433\u0440\u043e\u043a\u043e\u0432:";
const codeLabel = "\u043a\u043e\u0434:";
const prizeLabel = "\u041f\u0440\u0438\u0437:";
const prizeMissing = "\u0423\u0442\u043e\u0447\u043d\u044f\u0435\u0442\u0441\u044f";
const updatePrizeButton = "\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043f\u0440\u0438\u0437";
const chooseTournamentLabel = "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0443\u0440\u043d\u0438\u0440";
const shareButton = "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f";
const copyButton = "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c";
const shareSuccess = "\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435 \u0433\u043e\u0442\u043e\u0432\u043e \u043a \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0435.";
const shareFallback = "\u041e\u0442\u043a\u0440\u044b\u043b\u0438 \u043e\u043a\u043d\u043e \u043f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f.";
const shareError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u044c \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435.";
const copySuccess = "\u041a\u043e\u0434 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d.";
const copyError = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u0434.";
const shareCopiedFallback =
  "\u0412 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e\u0439 \u0441\u0431\u043e\u0440\u043a\u0435 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d bot username, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0442\u0435\u043a\u0441\u0442 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f \u043f\u0440\u043e\u0441\u0442\u043e \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d.";
const rankingTitle = "\u0420\u0435\u0439\u0442\u0438\u043d\u0433 \u043b\u0438\u0433\u0438";
const rankingEmpty = "\u0420\u0435\u0439\u0442\u0438\u043d\u0433 \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442.";
const pointsLabel = "\u043e\u0447\u043a\u043e\u0432";
const currentPlayerLabel = "\u0412\u044b";

type LeagueRankingResponse = {
  league: League;
  ranking: {
    entries: RankingEntry[];
    current_user_entry: RankingEntry | null;
  };
};

export function LeaguesManager() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [leagueRankings, setLeagueRankings] = useState<Record<number, LeagueRankingResponse["ranking"]>>({});
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    tournament_id: "",
    name: "",
    description: "",
    prize_description: prizePlaceholder,
  });
  const [inviteCode, setInviteCode] = useState("");
  const [editingPrize, setEditingPrize] = useState<Record<number, string>>({});

  async function load() {
    const [leagueRows, tournamentRows] = await Promise.all([apiGet<League[]>("/leagues"), apiGet<Tournament[]>("/tournaments")]);
    const rankingRows = await Promise.all(
      leagueRows.map(async (league) => {
        const response = await apiGet<LeagueRankingResponse>(`/leagues/${league.id}/ranking`);
        return [league.id, response.ranking] as const;
      }),
    );
    setLeagues(leagueRows);
    setTournaments(tournamentRows);
    setLeagueRankings(Object.fromEntries(rankingRows));
    setEditingPrize(Object.fromEntries(leagueRows.map((league) => [league.id, league.prize_description ?? prizePlaceholder])));
    setCreateForm((current) => ({
      ...current,
      tournament_id: current.tournament_id || (tournamentRows[0] ? String(tournamentRows[0].id) : ""),
    }));
  }

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    load()
      .catch(() => setMessage(loadError))
      .finally(() => setIsLoading(false));
  }, []);

  async function createLeague(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost<League>("/leagues", {
        tournament_id: Number(createForm.tournament_id),
        name: createForm.name,
        description: createForm.description || null,
        prize_description: createForm.prize_description || null,
      });
      setCreateForm({ tournament_id: createForm.tournament_id, name: "", description: "", prize_description: prizePlaceholder });
      setMessage(createSuccess);
      await load();
    } catch {
      setMessage(createError);
    }
  }

  async function joinLeague(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost<League>("/leagues/join", { invite_code: inviteCode.trim() });
      setInviteCode("");
      setMessage(joinSuccess);
      await load();
    } catch {
      setMessage(joinError);
    }
  }

  async function updatePrize(league: League) {
    setMessage(null);
    try {
      await apiPatch<League>(`/leagues/${league.id}`, {
        prize_description: editingPrize[league.id] || null,
      });
      setMessage(prizeUpdated);
      await load();
    } catch {
      setMessage(prizeError);
    }
  }

  async function copyInviteCode(league: League) {
    setMessage(null);
    try {
      await navigator.clipboard.writeText(league.invite_code);
      setMessage(copySuccess);
    } catch {
      setMessage(copyError);
    }
  }

  async function shareLeagueInvite(league: League) {
    setMessage(null);
    const tournamentName = tournaments.find((tournament) => tournament.id === league.tournament_id)?.name ?? `#${league.tournament_id}`;
    const text = buildLeagueInviteTextSafe(league, tournamentName);
    const botUsername = (process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, "");
    const botUrl = botUsername ? `https://t.me/${botUsername}` : null;

    try {
      if (navigator.share) {
        await navigator.share({
          title: league.name,
          text,
          ...(botUrl ? { url: botUrl } : {}),
        });
        setMessage(shareSuccess);
        return;
      }

      if (!botUrl) {
        await navigator.clipboard.writeText(text);
        setMessage(shareCopiedFallback);
        return;
      }

      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
      const telegramWebApp = window.Telegram?.WebApp as { openTelegramLink?: (url: string) => void } | undefined;
      if (telegramWebApp?.openTelegramLink) {
        telegramWebApp.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
      setMessage(shareFallback);
    } catch {
      setMessage(shareError);
    }
  }

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-[24px] border border-black/5 bg-white/90 p-4 text-sm text-muted shadow-sm">{loadingLabel}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-[26px] border border-black/5 bg-[linear-gradient(135deg,rgba(23,32,51,0.12),rgba(15,118,110,0.12))] p-5 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{heroEyebrow}</div>
        <h2 className="mt-2 text-xl font-semibold">{heroTitle}</h2>
        <p className="mt-2 text-sm text-muted">{heroBody}</p>
      </section>

      <form onSubmit={createLeague} className="flex flex-col gap-3 rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <h2 className="text-sm font-semibold">{createTitle}</h2>
        <select
          className="rounded-2xl border border-black/10 px-3 py-2 text-sm"
          value={createForm.tournament_id}
          onChange={(event) => setCreateForm({ ...createForm, tournament_id: event.target.value })}
        >
          <option value="" disabled>
            {chooseTournamentLabel}
          </option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
        <div className="text-xs text-muted">{tournamentLabel}</div>
        <input
          className="rounded-2xl border border-black/10 px-3 py-2 text-sm"
          placeholder={leagueNamePlaceholder}
          value={createForm.name}
          onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
        />
        <input
          className="rounded-2xl border border-black/10 px-3 py-2 text-sm"
          placeholder={descriptionPlaceholder}
          value={createForm.description}
          onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
        />
        <textarea
          className="min-h-20 rounded-2xl border border-black/10 px-3 py-2 text-sm"
          placeholder={prizePlaceholder}
          value={createForm.prize_description}
          onChange={(event) => setCreateForm({ ...createForm, prize_description: event.target.value })}
        />
        <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white">{createButton}</button>
      </form>

      <form onSubmit={joinLeague} className="flex flex-col gap-3 rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <h2 className="text-sm font-semibold">{joinTitle}</h2>
        <input
          className="rounded-2xl border border-black/10 px-3 py-2 text-sm"
          placeholder={invitePlaceholder}
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
        />
        <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white">{joinButton}</button>
      </form>

      {message ? <div className="rounded-[24px] border border-black/5 bg-white/92 p-4 text-sm text-muted shadow-[0_10px_30px_rgba(23,32,51,0.08)]">{message}</div> : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">{yourLeaguesTitle}</h2>
        {leagues.length === 0 ? (
          <div className="rounded-[24px] border border-black/5 bg-white/92 p-4 text-sm text-muted shadow-[0_10px_30px_rgba(23,32,51,0.08)]">{noLeaguesLabel}</div>
        ) : (
          leagues.map((league) => (
            <article key={league.id} className="flex flex-col gap-3 rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
              <div>
                <div className="text-sm font-semibold">{league.name}</div>
                <div className="mt-1 text-xs text-muted">
                  {(tournaments.find((tournament) => tournament.id === league.tournament_id)?.name ?? `#${league.tournament_id}`)} {" \u00b7 "} {membersLabel} {league.members_count} {" \u00b7 "} {codeLabel} {league.invite_code}
                </div>
              </div>
              {league.description ? <p className="text-sm text-muted">{league.description}</p> : null}
              <div className="rounded-2xl bg-surface px-3 py-2 text-sm">
                {prizeLabel} {league.prize_description || prizeMissing}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium"
                  onClick={() => shareLeagueInvite(league)}
                >
                  {shareButton}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium"
                  onClick={() => copyInviteCode(league)}
                >
                  {copyButton}
                </button>
              </div>
              <LeagueRankingCard ranking={leagueRankings[league.id]} />
              {league.is_owner ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="min-h-20 rounded-2xl border border-black/10 px-3 py-2 text-sm"
                    value={editingPrize[league.id] ?? ""}
                    onChange={(event) => setEditingPrize({ ...editingPrize, [league.id]: event.target.value })}
                  />
                  <button
                    type="button"
                    className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium"
                    onClick={() => updatePrize(league)}
                  >
                    {updatePrizeButton}
                  </button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function LeagueRankingCard({ ranking }: { ranking: LeagueRankingResponse["ranking"] | undefined }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-[rgba(23,32,51,0.03)] p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{rankingTitle}</div>
      <div className="mt-3 flex flex-col gap-2">
        {!ranking || ranking.entries.length === 0 ? (
          <div className="text-sm text-muted">{rankingEmpty}</div>
        ) : (
          ranking.entries.map((entry) => <LeagueRankingRow key={entry.user_id} entry={entry} />)
        )}
      </div>
    </section>
  );
}

function buildLeagueInviteTextSafe(league: League, tournamentName: string): string {
  return [
    `\u041b\u0438\u0433\u0430: ${league.name}`,
    `\u0422\u0443\u0440\u043d\u0438\u0440: ${tournamentName}`,
    `\u041a\u043e\u0434 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f: ${league.invite_code}`,
    "\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 Prognozist \u0432 Telegram \u0438 \u0432\u0441\u0442\u0443\u043f\u0438\u0442\u0435 \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u043a\u043e\u0434\u0443.",
  ].join("\n");
}

function LeagueRankingRow({ entry }: { entry: RankingEntry }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm ${entry.is_current_user ? "bg-[rgba(15,118,110,0.08)]" : "bg-white/80"}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(23,32,51,0.06)] text-xs font-semibold text-muted">
          #{entry.rank}
        </div>
        <div>
          <div className="font-semibold text-ink">{entry.first_name ?? entry.username ?? `user ${entry.telegram_id}`}</div>
          <div className="text-xs text-muted">{entry.is_current_user ? currentPlayerLabel : `id ${entry.telegram_id}`}</div>
        </div>
      </div>
      <div className="rounded-full bg-[rgba(23,32,51,0.05)] px-3 py-1 text-sm font-semibold">
        {entry.points} {pointsLabel}
      </div>
    </div>
  );
}
