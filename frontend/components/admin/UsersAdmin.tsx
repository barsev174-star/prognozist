"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { apiGet, apiPatch, apiPost, type UserProfile } from "@/lib/api";

function formatDate(value: string | null): string {
  if (!value) {
    return "нет";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function UsersAdmin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [vipDates, setVipDates] = useState<Record<number, string>>({});

  const sortedUsers = useMemo(
    () => [...users].sort((left, right) => right.points_total - left.points_total || right.id - left.id),
    [users],
  );

  async function load() {
    const rows = await apiGet<UserProfile[]>("/admin/users");
    setUsers(rows);
    setVipDates(Object.fromEntries(rows.map((user) => [user.id, toDateTimeLocal(user.premium_until)])));
  }

  useEffect(() => {
    load().catch(() => setMessage("Не удалось загрузить пользователей."));
  }, []);

  async function toggleBlocked(user: UserProfile) {
    setMessage(null);
    try {
      await apiPatch<UserProfile>(`/admin/users/${user.id}`, { is_blocked: !user.is_blocked });
      await load();
    } catch {
      setMessage("Не удалось изменить блокировку пользователя.");
    }
  }

  async function saveVipDate(user: UserProfile) {
    setMessage(null);
    const value = vipDates[user.id];

    try {
      await apiPatch<UserProfile>(`/admin/users/${user.id}`, {
        premium_until: value ? new Date(value).toISOString() : null,
      });
      await load();
      setMessage("VIP-дата сохранена.");
    } catch {
      setMessage("Не удалось сохранить VIP-дату.");
    }
  }

  async function grantVip(user: UserProfile, durationDays: number) {
    setMessage(null);

    try {
      await apiPost<UserProfile>(`/admin/users/${user.id}/grant-vip`, { duration_days: durationDays });
      await load();
      setMessage(`VIP на ${durationDays} дней выдан.`);
    } catch {
      setMessage("Не удалось выдать VIP.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Пользователи</h2>
            <p className="mt-1 text-sm text-muted">Игроки, созданные через Telegram или локальный вход.</p>
          </div>
          <button type="button" onClick={() => load()} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium">
            Обновить
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      </section>

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        {sortedUsers.length === 0 ? (
          <div className="p-4 text-sm text-muted">Пользователей пока нет.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {sortedUsers.map((user) => (
              <article key={user.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_220px_220px] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{user.first_name ?? user.username ?? `Игрок ${user.telegram_id}`}</span>
                    {user.is_blocked ? (
                      <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">заблокирован</span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                    <span>user #{user.id}</span>
                    <span>telegram {user.telegram_id}</span>
                    {user.username ? <span>@{user.username}</span> : null}
                    <span>{user.points_total} очков</span>
                  </div>
                  <div className="mt-1 text-sm text-muted">VIP до: {formatDate(user.premium_until)}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => grantVip(user, 30)} className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white">
                    Выдать VIP на 30 дней
                  </button>
                  <button type="button" onClick={() => toggleBlocked(user)} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium">
                    {user.is_blocked ? "Разблокировать" : "Заблокировать"}
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <AdminField label="VIP до">
                    <input
                      type="datetime-local"
                      className={inputClassName}
                      value={vipDates[user.id] ?? ""}
                      onChange={(event) => setVipDates({ ...vipDates, [user.id]: event.target.value })}
                    />
                  </AdminField>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => saveVipDate(user)} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium">
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVipDates({ ...vipDates, [user.id]: "" });
                        apiPatch<UserProfile>(`/admin/users/${user.id}`, { premium_until: null })
                          .then(load)
                          .catch(() => setMessage("Не удалось убрать VIP."));
                      }}
                      className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium"
                    >
                      Убрать VIP
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
