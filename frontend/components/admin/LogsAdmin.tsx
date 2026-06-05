"use client";

import { useEffect, useMemo, useState } from "react";

import { apiGet, type AdminPointsLog, type AdminSystemLog } from "@/lib/api";

type LogTab = "system" | "points";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatUser(log: { first_name: string | null; username: string | null; telegram_id: number | null }): string {
  if (log.first_name) {
    return log.first_name;
  }
  if (log.username) {
    return `@${log.username}`;
  }
  return log.telegram_id ? `telegram ${log.telegram_id}` : "система";
}

function formatEventType(value: string): string {
  const labels: Record<string, string> = {
    admin_match_created: "Матч создан",
    admin_match_completed: "Матч завершен",
    admin_user_updated: "Пользователь изменен",
    admin_vip_granted: "VIP выдан",
  };

  return labels[value] ?? value;
}

function formatSourceType(value: string): string {
  const labels: Record<string, string> = {
    score_prediction: "Прогноз счета",
    public_question_answer: "Публичный вопрос",
    vip_question_answer: "VIP-вопрос",
    referral_reward: "Реферал",
  };

  return labels[value] ?? value;
}

export function LogsAdmin() {
  const [tab, setTab] = useState<LogTab>("system");
  const [systemLogs, setSystemLogs] = useState<AdminSystemLog[]>([]);
  const [pointsLogs, setPointsLogs] = useState<AdminPointsLog[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setMessage(null);
    try {
      const [systemRows, pointsRows] = await Promise.all([
        apiGet<AdminSystemLog[]>("/admin/logs/system?limit=100"),
        apiGet<AdminPointsLog[]>("/admin/logs/points?limit=100"),
      ]);
      setSystemLogs(systemRows);
      setPointsLogs(pointsRows);
    } catch {
      setMessage("Не удалось загрузить журнал.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(() => (tab === "system" ? systemLogs.length : pointsLogs.length), [pointsLogs.length, systemLogs.length, tab]);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Журнал</h2>
            <p className="mt-1 text-sm text-muted">Последние события админки и начисления очков.</p>
          </div>
          <button type="button" onClick={load} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium">
            Обновить
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <TabButton active={tab === "system"} onClick={() => setTab("system")}>
            События
          </TabButton>
          <TabButton active={tab === "points"} onClick={() => setTab("points")}>
            Очки
          </TabButton>
        </div>
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      </section>

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        {activeCount === 0 ? (
          <div className="p-4 text-sm text-muted">Записей пока нет.</div>
        ) : tab === "system" ? (
          <SystemLogsList logs={systemLogs} />
        ) : (
          <PointsLogsList logs={pointsLogs} />
        )}
      </section>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-ink text-white" : "border border-black/10 bg-white text-ink"}`}
    >
      {children}
    </button>
  );
}

function SystemLogsList({ logs }: { logs: AdminSystemLog[] }) {
  return (
    <div className="divide-y divide-black/5">
      {logs.map((log) => (
        <article key={log.id} className="grid gap-2 p-4 md:grid-cols-[180px_1fr]">
          <div className="text-sm text-muted">{formatDate(log.created_at)}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{formatEventType(log.event_type)}</span>
              <span className="text-sm text-muted">{formatUser(log)}</span>
            </div>
            {log.payload_json ? (
              <pre className="mt-2 overflow-auto rounded-md bg-surface p-3 text-xs text-muted">
                {JSON.stringify(log.payload_json, null, 2)}
              </pre>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function PointsLogsList({ logs }: { logs: AdminPointsLog[] }) {
  return (
    <div className="divide-y divide-black/5">
      {logs.map((log) => (
        <article key={log.id} className="grid gap-2 p-4 md:grid-cols-[180px_1fr_90px] md:items-center">
          <div className="text-sm text-muted">{formatDate(log.created_at)}</div>
          <div>
            <div className="font-medium">{formatUser(log)}</div>
            <div className="mt-1 text-sm text-muted">
              {formatSourceType(log.source_type)} #{log.source_id}
            </div>
          </div>
          <div className={log.points > 0 ? "font-semibold text-green-700" : "font-semibold text-muted"}>+{log.points}</div>
        </article>
      ))}
    </div>
  );
}
