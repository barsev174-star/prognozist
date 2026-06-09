"use client";

import { useEffect, useMemo, useState } from "react";

import { apiGet, type AdminPointsLog, type AdminStarsSummary, type AdminSystemLog } from "@/lib/api";

type LogTab = "system" | "points";
type SystemFilter = "all" | "donations" | "support";

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
  return log.telegram_id ? `telegram ${log.telegram_id}` : "\u0441\u0438\u0441\u0442\u0435\u043c\u0430";
}

function formatEventType(value: string): string {
  const labels: Record<string, string> = {
    admin_match_created: "\u041c\u0430\u0442\u0447 \u0441\u043e\u0437\u0434\u0430\u043d",
    admin_match_completed: "\u041c\u0430\u0442\u0447 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d",
    admin_user_updated: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d",
    admin_vip_granted: "VIP \u0432\u044b\u0434\u0430\u043d",
    donation_paid: "\u0414\u043e\u043d\u0430\u0442 \u043e\u043f\u043b\u0430\u0447\u0435\u043d",
    user_support_message: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443",
  };

  return labels[value] ?? value;
}

function formatSourceType(value: string): string {
  const labels: Record<string, string> = {
    score_prediction: "\u041f\u0440\u043e\u0433\u043d\u043e\u0437 \u0441\u0447\u0435\u0442\u0430",
    public_question_answer: "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u0432\u043e\u043f\u0440\u043e\u0441",
    vip_question_answer: "VIP-\u0432\u043e\u043f\u0440\u043e\u0441",
    referral_reward: "\u0420\u0435\u0444\u0435\u0440\u0430\u043b",
  };

  return labels[value] ?? value;
}

function formatSystemPayload(log: AdminSystemLog): string {
  if (!log.payload_json) {
    return "";
  }

  if (log.event_type === "donation_paid") {
    const donationId = log.payload_json["donation_id"];
    const starsAmount = log.payload_json["stars_amount"];
    const chargeId = log.payload_json["telegram_payment_charge_id"];
    return [
      `donation_id: ${String(donationId ?? "-")}`,
      `stars_amount: ${String(starsAmount ?? "-")}`,
      `telegram_payment_charge_id: ${String(chargeId ?? "-")}`,
    ].join("\n");
  }

  if (log.event_type === "user_support_message") {
    const category = log.payload_json["category"];
    const message = log.payload_json["message"];
    const source = log.payload_json["source"];
    return [
      `category: ${String(category ?? "-")}`,
      `source: ${String(source ?? "-")}`,
      "",
      String(message ?? ""),
    ].join("\n");
  }

  return JSON.stringify(log.payload_json, null, 2);
}

export function LogsAdmin() {
  const [tab, setTab] = useState<LogTab>("system");
  const [systemFilter, setSystemFilter] = useState<SystemFilter>("all");
  const [systemLogs, setSystemLogs] = useState<AdminSystemLog[]>([]);
  const [pointsLogs, setPointsLogs] = useState<AdminPointsLog[]>([]);
  const [starsSummary, setStarsSummary] = useState<AdminStarsSummary | null>(null);
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
      apiGet<AdminStarsSummary>("/admin/stars/summary")
        .then(setStarsSummary)
        .catch(() => setStarsSummary(null));
    } catch {
      setMessage("\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0436\u0443\u0440\u043d\u0430\u043b.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredSystemLogs = useMemo(
    () =>
      systemLogs.filter((log) => {
        if (systemFilter === "donations") {
          return log.event_type === "donation_paid";
        }
        if (systemFilter === "support") {
          return log.event_type === "user_support_message";
        }
        return true;
      }),
    [systemFilter, systemLogs],
  );

  const activeCount = useMemo(() => {
    if (tab === "system") {
      return filteredSystemLogs.length;
    }
    return pointsLogs.length;
  }, [filteredSystemLogs.length, pointsLogs.length, tab]);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        {starsSummary ? (
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Stars balance" value={String(starsSummary.balance.amount)} />
            <MetricCard label="\u041f\u043e\u0441\u0442\u0443\u043f\u0438\u043b\u043e" value={String(starsSummary.incoming_total)} />
            <MetricCard label="\u0421\u043f\u0438\u0441\u0430\u043d\u043e" value={String(starsSummary.outgoing_total)} />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">\u0416\u0443\u0440\u043d\u0430\u043b</h2>
            <p className="mt-1 text-sm text-muted">
              \u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u044f \u0430\u0434\u043c\u0438\u043d\u043a\u0438, \u0434\u043e\u043d\u0430\u0442\u044b, \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u044f \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \u0438 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f \u043e\u0447\u043a\u043e\u0432.
            </p>
          </div>
          <button type="button" onClick={load} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium">
            \u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <TabButton active={tab === "system"} onClick={() => setTab("system")}>
            \u0421\u043e\u0431\u044b\u0442\u0438\u044f
          </TabButton>
          <TabButton active={tab === "points"} onClick={() => setTab("points")}>
            \u041e\u0447\u043a\u0438
          </TabButton>
        </div>
        {tab === "system" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <TabButton active={systemFilter === "all"} onClick={() => setSystemFilter("all")}>
              \u0412\u0441\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u044f
            </TabButton>
            <TabButton active={systemFilter === "donations"} onClick={() => setSystemFilter("donations")}>
              \u0414\u043e\u043d\u0430\u0442\u044b
            </TabButton>
            <TabButton active={systemFilter === "support"} onClick={() => setSystemFilter("support")}>
              \u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430
            </TabButton>
          </div>
        ) : null}
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      </section>

      {starsSummary?.transactions.length ? (
        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-black/5 px-4 py-3 text-sm font-semibold">\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438 Stars</div>
          <div className="divide-y divide-black/5">
            {starsSummary.transactions.map((transaction) => (
              <article key={transaction.id} className="grid gap-2 p-4 md:grid-cols-[180px_1fr_90px] md:items-center">
                <div className="text-sm text-muted">{formatDate(transaction.created_at)}</div>
                <div>
                  <div className="font-medium">{transaction.title}</div>
                  <div className="mt-1 text-sm text-muted">
                    {transaction.transaction_type ?? transaction.partner_type}
                    {transaction.is_refund ? " · refund" : ""}
                  </div>
                </div>
                <div className={transaction.amount >= 0 ? "font-semibold text-green-700" : "font-semibold text-muted"}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        {activeCount === 0 ? (
          <div className="p-4 text-sm text-muted">\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.</div>
        ) : tab === "system" ? (
          <SystemLogsList logs={filteredSystemLogs} />
        ) : (
          <PointsLogsList logs={pointsLogs} />
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/5 bg-surface px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-2 text-xl font-semibold text-ink">{value}</div>
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
              <pre className="mt-2 overflow-auto rounded-md bg-surface p-3 text-xs text-muted whitespace-pre-wrap">{formatSystemPayload(log)}</pre>
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
