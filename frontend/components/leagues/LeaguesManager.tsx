"use client";

import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
import { apiGet, apiPatch, apiPost, hasAccessToken, type League } from "@/lib/api";

export function LeaguesManager() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    tournament_id: "",
    name: "",
    description: "",
    prize_description: "",
  });
  const [inviteCode, setInviteCode] = useState("");
  const [editingPrize, setEditingPrize] = useState<Record<number, string>>({});

  async function load() {
    const rows = await apiGet<League[]>("/leagues");
    setLeagues(rows);
    setEditingPrize(Object.fromEntries(rows.map((league) => [league.id, league.prize_description ?? ""])));
  }

  useEffect(() => {
    const tokenExists = hasAccessToken();
    setHasToken(tokenExists);
    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    load()
      .catch(() => setMessage("Не удалось загрузить лиги."))
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
      setCreateForm({ tournament_id: createForm.tournament_id, name: "", description: "", prize_description: "" });
      setMessage("Лига создана.");
      await load();
    } catch {
      setMessage("Не удалось создать лигу. Проверьте ID турнира и название.");
    }
  }

  async function joinLeague(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost<League>("/leagues/join", { invite_code: inviteCode.trim() });
      setInviteCode("");
      setMessage("Вы вступили в лигу.");
      await load();
    } catch {
      setMessage("Не удалось вступить в лигу. Проверьте код приглашения.");
    }
  }

  async function updatePrize(league: League) {
    setMessage(null);
    try {
      await apiPatch<League>(`/leagues/${league.id}`, {
        prize_description: editingPrize[league.id] || null,
      });
      setMessage("Приз лиги обновлён.");
      await load();
    } catch {
      setMessage("Не удалось обновить приз. Менять приз может только владелец активной лиги.");
    }
  }

  if (!hasToken && !isLoading) {
    return <LocalAuthNotice />;
  }

  if (isLoading) {
    return <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={createLeague} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Создать лигу</h2>
        <input
          className="rounded-md border border-black/10 px-3 py-2 text-sm"
          inputMode="numeric"
          placeholder="ID турнира"
          value={createForm.tournament_id}
          onChange={(event) => setCreateForm({ ...createForm, tournament_id: event.target.value })}
        />
        <input
          className="rounded-md border border-black/10 px-3 py-2 text-sm"
          placeholder="Название лиги"
          value={createForm.name}
          onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
        />
        <input
          className="rounded-md border border-black/10 px-3 py-2 text-sm"
          placeholder="Описание"
          value={createForm.description}
          onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
        />
        <textarea
          className="min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm"
          placeholder="Приз лиги"
          value={createForm.prize_description}
          onChange={(event) => setCreateForm({ ...createForm, prize_description: event.target.value })}
        />
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать</button>
      </form>

      <form onSubmit={joinLeague} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Вступить по коду</h2>
        <input
          className="rounded-md border border-black/10 px-3 py-2 text-sm"
          placeholder="Код приглашения"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
        />
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Вступить</button>
      </form>

      {message ? <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">{message}</div> : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Ваши лиги</h2>
        {leagues.length === 0 ? (
          <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Лиг пока нет.</div>
        ) : (
          leagues.map((league) => (
            <article key={league.id} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
              <div>
                <div className="text-sm font-semibold">{league.name}</div>
                <div className="mt-1 text-xs text-muted">
                  Турнир #{league.tournament_id} · игроков: {league.members_count} · код: {league.invite_code}
                </div>
              </div>
              {league.description ? <p className="text-sm text-muted">{league.description}</p> : null}
              <div className="rounded-md bg-surface px-3 py-2 text-sm">
                Приз: {league.prize_description || "не указан"}
              </div>
              {league.is_owner ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="min-h-20 rounded-md border border-black/10 px-3 py-2 text-sm"
                    value={editingPrize[league.id] ?? ""}
                    onChange={(event) => setEditingPrize({ ...editingPrize, [league.id]: event.target.value })}
                  />
                  <button
                    type="button"
                    className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium"
                    onClick={() => updatePrize(league)}
                  >
                    Обновить приз
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
