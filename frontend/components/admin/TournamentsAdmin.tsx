"use client";

import { useEffect, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { apiGet, apiPost } from "@/lib/api";

type Season = { id: number; name: string };
type Tournament = {
  id: number;
  season_id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
};

export function TournamentsAdmin() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState({
    season_id: "",
    name: "",
    description: "",
    start_date: "2026-06-01",
    end_date: "2026-07-31",
    status: "active"
  });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [seasonRows, tournamentRows] = await Promise.all([
      apiGet<Season[]>("/admin/seasons"),
      apiGet<Tournament[]>("/admin/tournaments")
    ]);
    setSeasons(seasonRows);
    setTournaments(tournamentRows);
    if (!form.season_id && seasonRows[0]) {
      setForm((current) => ({ ...current, season_id: String(seasonRows[0].id) }));
    }
  }

  useEffect(() => {
    load().catch(() => setError("Не удалось загрузить турниры."));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await apiPost<Tournament>("/admin/tournaments", { ...form, season_id: Number(form.season_id) });
      setForm({ ...form, name: "", description: "" });
      await load();
    } catch {
      setError("Не удалось создать турнир.");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <AdminField label="Сезон">
          <select className={inputClassName} value={form.season_id} onChange={(e) => setForm({ ...form, season_id: e.target.value })}>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>{season.name}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Название">
          <input className={inputClassName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </AdminField>
        <AdminField label="Описание">
          <textarea className={inputClassName} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </AdminField>
        <AdminField label="Начало">
          <input type="date" className={inputClassName} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </AdminField>
        <AdminField label="Окончание">
          <input type="date" className={inputClassName} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать турнир</button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <section className="rounded-lg bg-white shadow-sm">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="border-b border-black/5 p-4 last:border-b-0">
            <div className="font-medium">{tournament.name}</div>
            <div className="text-sm text-muted">
              #{tournament.id} · season #{tournament.season_id} · {tournament.status}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
