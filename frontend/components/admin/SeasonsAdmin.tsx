"use client";

import { useEffect, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { apiGet, apiPost } from "@/lib/api";

type Season = {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
};

export function SeasonsAdmin() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "2026-06-01",
    end_date: "2026-07-31",
    status: "active"
  });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setSeasons(await apiGet<Season[]>("/admin/seasons"));
  }

  useEffect(() => {
    load().catch(() => setError("Не удалось загрузить сезоны."));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await apiPost<Season>("/admin/seasons", form);
      setForm({ ...form, name: "", description: "" });
      await load();
    } catch {
      setError("Не удалось создать сезон.");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
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
        <AdminField label="Статус">
          <select className={inputClassName} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="upcoming">upcoming</option>
            <option value="active">active</option>
            <option value="completed">completed</option>
          </select>
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать сезон</button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <section className="rounded-lg bg-white shadow-sm">
        {seasons.map((season) => (
          <div key={season.id} className="border-b border-black/5 p-4 last:border-b-0">
            <div className="font-medium">{season.name}</div>
            <div className="text-sm text-muted">
              #{season.id} · {season.status} · {season.start_date} - {season.end_date}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

