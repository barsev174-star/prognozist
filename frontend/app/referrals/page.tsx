"use client";

import { AppHeader } from "@/components/AppHeader";
import { AuthGate } from "@/components/AuthGate";
import { useEffect, useState } from "react";

import { apiGet, type ReferralStats } from "@/lib/api";

const title = "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044b";
const eyebrow = "\u0420\u043e\u0441\u0442 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0430";
const heroTitle = "\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0430\u0439\u0442\u0435 \u0434\u0440\u0443\u0437\u0435\u0439 \u0432 Prognozist";
const heroBody = "\u0421\u043a\u043e\u0440\u043e \u0437\u0434\u0435\u0441\u044c \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0432\u0430\u0448\u0430 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0441\u044b\u043b\u043a\u0430, \u0447\u0442\u043e\u0431\u044b \u0440\u0430\u0441\u0442\u0438\u0442\u044c \u0441\u0432\u043e\u044e \u043b\u0438\u0433\u0443 \u0438 \u0432\u043e\u0432\u043b\u0435\u043a\u0430\u0442\u044c \u043d\u043e\u0432\u044b\u0445 \u0438\u0433\u0440\u043e\u043a\u043e\u0432.";
const cardTitle = "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0441\u044b\u043b\u043a\u0430";
const cardBody = "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u0441\u0441\u044b\u043b\u043a\u043e\u0439 \u0441 \u0434\u0440\u0443\u0437\u044c\u044f\u043c\u0438. \u0410\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u044f \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0438\u0445 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u0430.";
const loadingText = "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";
const errorText = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0440\u0435\u0444\u0435\u0440\u0430\u043b\u044b.";
const copyLabel = "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c";
const shareLabel = "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f";
const copiedText = "\u0421\u0441\u044b\u043b\u043a\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0430.";
const shareTextPrefix = "\u041f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0439\u0441\u044f \u043a Prognozist:";
const invitedLabel = "\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u043e";
const activatedLabel = "\u0410\u043a\u0442\u0438\u0432\u0438\u0440\u043e\u0432\u0430\u043d\u043e";
const pointsLabel = "\u041e\u0447\u043a\u0438";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ReferralStats };

export default function ReferralsPage() {
  return (
    <>
      <AppHeader title={title} />
      <AuthGate>{() => <ReferralsContent />}</AuthGate>
    </>
  );
}

function ReferralsContent() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ReferralStats>("/referrals/me")
      .then((data) => setState({ status: "ready", data }))
      .catch(() => setState({ status: "error" }));
  }, []);

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setMessage(copiedText);
  }

  async function shareLink(link: string) {
    const text = `${shareTextPrefix} ${link}`;
    if (navigator.share) {
      await navigator.share({ text, url: link });
      return;
    }
    await copyLink(link);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5">
      <section className="rounded-[26px] border border-black/5 bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(34,197,94,0.12))] p-5 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
        <h2 className="mt-2 text-xl font-semibold">{heroTitle}</h2>
        <p className="mt-2 text-sm text-muted">{heroBody}</p>
      </section>

      <section className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <h3 className="text-sm font-semibold">{cardTitle}</h3>
        <p className="mt-2 text-sm text-muted">{cardBody}</p>
        {state.status === "loading" ? <p className="mt-3 text-sm text-muted">{loadingText}</p> : null}
        {state.status === "error" ? <p className="mt-3 text-sm text-red-600">{errorText}</p> : null}
        {state.status === "ready" ? (
          <>
            <div className="mt-4 rounded-[20px] bg-[rgba(23,32,51,0.04)] px-4 py-3 text-sm text-ink break-all">{state.data.referral_link}</div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatCard label={invitedLabel} value={state.data.registered_count} />
              <StatCard label={activatedLabel} value={state.data.activated_count} />
              <StatCard label={pointsLabel} value={state.data.referral_points} />
            </div>
            {state.data.next_reward_at && state.data.next_reward_points ? (
              <p className="mt-4 text-sm text-muted">
                {`\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u043d\u0430\u0433\u0440\u0430\u0434\u0430: ${state.data.next_reward_points} \u043e\u0447\u043a\u043e\u0432 \u0437\u0430 ${state.data.next_reward_at} \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0434\u0440\u0443\u0437\u0435\u0439.`}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white" type="button" onClick={() => shareLink(state.data.referral_link)}>
                {shareLabel}
              </button>
              <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink" type="button" onClick={() => copyLink(state.data.referral_link)}>
                {copyLabel}
              </button>
            </div>
            {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] bg-[rgba(23,32,51,0.04)] px-3 py-3 text-center">
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</div>
    </div>
  );
}
