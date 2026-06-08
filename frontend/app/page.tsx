"use client";

import Link from "next/link";

import { AuthGate } from "@/components/AuthGate";
import type { UserProfile } from "@/lib/api";

const sections = [
  { href: "/matches", label: "\u041c\u0430\u0442\u0447\u0438", eyebrow: "\u0418\u0433\u0440\u043e\u0432\u043e\u0439 \u0434\u0435\u043d\u044c" },
  { href: "/tournaments", label: "\u0422\u0443\u0440\u043d\u0438\u0440\u044b", eyebrow: "\u0414\u043e\u043b\u0433\u0438\u0439 \u043f\u0440\u043e\u0433\u043d\u043e\u0437" },
  { href: "/rankings", label: "\u0420\u0435\u0439\u0442\u0438\u043d\u0433", eyebrow: "\u0422\u0430\u0431\u043b\u0438\u0446\u0430" },
  { href: "/leagues", label: "\u041b\u0438\u0433\u0438", eyebrow: "\u0421\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e" },
  { href: "/profile", label: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c", eyebrow: "\u0410\u043a\u043a\u0430\u0443\u043d\u0442" },
  { href: "/referrals", label: "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044b", eyebrow: "\u0420\u043e\u0441\u0442" },
];

const heroTitle = "\u0422\u0443\u0440\u043d\u0438\u0440 \u0444\u0443\u0442\u0431\u043e\u043b\u044c\u043d\u044b\u0445 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u0438\u0441\u0442\u043e\u0432";
const defaultPlayerName = "\u0418\u0433\u0440\u043e\u043a";
const heroBodyPrefix = "\u0441\u0435\u0433\u043e\u0434\u043d\u044f \u0445\u043e\u0440\u043e\u0448\u0438\u0439 \u0434\u0435\u043d\u044c, \u0447\u0442\u043e\u0431\u044b \u0437\u0430\u0431\u0440\u0430\u0442\u044c \u043e\u0447\u043a\u0438 \u0434\u043e \u0441\u0442\u0430\u0440\u0442\u043e\u0432\u043e\u0433\u043e \u0441\u0432\u0438\u0441\u0442\u043a\u0430.";
const openSectionLabel = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b \u2192";
const logoutLabel = "\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0443\u0447\u0435\u0442\u043d\u043e\u0439 \u0437\u0430\u043f\u0438\u0441\u0438";
const vipStatusLabel = "VIP \u0441\u0442\u0430\u0442\u0443\u0441";
const vipActiveLabel = "\u0410\u043a\u0442\u0438\u0432\u0435\u043d";
const vipInactiveLabel = "\u041d\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d";
const vipManageLabel = "\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0442\u044c VIP";
const vipExpired = "\u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u0439 VIP-\u0434\u043e\u0441\u0442\u0443\u043f \u0438\u0441\u0442\u0435\u043a.";
const vipUpsell =
  "\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 VIP, \u0447\u0442\u043e\u0431\u044b \u043e\u0442\u0432\u0435\u0447\u0430\u0442\u044c \u043d\u0430 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435 \u043e\u0447\u043a\u043e\u0432.";

export default function HomePage() {
  function logout() {
    sessionStorage.removeItem("access_token");
    window.location.href = "/dev-login";
  }

  return (
    <AuthGate>
      {(user) => (
        <main className="min-h-screen px-4 py-5">
          <div className="mx-auto flex max-w-md flex-col gap-4">
            <section className="relative overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#103b35_0%,#172033_56%,#264653_100%)] px-5 py-6 text-white shadow-[0_18px_55px_rgba(23,32,51,0.22)]">
              <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-[rgba(255,199,0,0.18)] blur-2xl" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[rgba(255,255,255,0.08)] blur-2xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,255,255,0.72)]">Prognozist</p>
                <h1 className="mt-2 max-w-xs text-3xl font-semibold leading-tight">{heroTitle}</h1>
                <p className="mt-3 max-w-sm text-sm text-[rgba(255,255,255,0.78)]">
                  {(user.first_name ?? user.username ?? defaultPlayerName) + ", " + heroBodyPrefix}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>Telegram Mini App</Badge>
                  <Badge>Live-matches</Badge>
                  <Badge>{"VIP-\u043f\u0443\u043b"}</Badge>
                </div>
              </div>
            </section>

            <VipStatusCard user={user} />

            <nav className="grid grid-cols-2 gap-3">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group rounded-[24px] border border-black/5 bg-white/90 px-4 py-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{section.eyebrow}</div>
                  <div className="mt-2 text-base font-semibold text-ink">{section.label}</div>
                  <div className="mt-3 text-xs text-muted transition-colors group-hover:text-ink">{openSectionLabel}</div>
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className="rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm font-medium text-muted shadow-sm"
              onClick={logout}
            >
              {logoutLabel}
            </button>
          </div>
        </main>
      )}
    </AuthGate>
  );
}

function VipStatusCard({ user }: { user: UserProfile }) {
  const premiumUntil = user.premium_until ? new Date(user.premium_until) : null;
  const hasVip = premiumUntil !== null && premiumUntil.getTime() > Date.now();
  const formattedDate = premiumUntil
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(premiumUntil)
    : null;

  return (
    <section className="rounded-[24px] border border-black/5 bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{vipStatusLabel}</p>
          <h2 className="mt-1 text-lg font-semibold">{hasVip ? vipActiveLabel : vipInactiveLabel}</h2>
          <p className="mt-2 text-sm text-muted">
            {hasVip && formattedDate ? `\u0414\u043e\u0441\u0442\u0443\u043f \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043e ${formattedDate}.` : premiumUntil ? vipExpired : vipUpsell}
          </p>
        </div>
        <span
          className={
            hasVip
              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-800"
              : "rounded-full bg-[rgba(23,32,51,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted"
          }
        >
          {hasVip ? "VIP" : "Free"}
        </span>
      </div>
      <Link className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white" href="/vip">
        {vipManageLabel}
      </Link>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/88">
      {children}
    </span>
  );
}
