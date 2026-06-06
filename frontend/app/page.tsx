"use client";

import Link from "next/link";

import { AuthGate } from "@/components/AuthGate";
import type { UserProfile } from "@/lib/api";

const sections = [
  { href: "/matches", label: "Матчи" },
  { href: "/rankings", label: "Рейтинг" },
  { href: "/leagues", label: "Лиги" },
  { href: "/profile", label: "Профиль" },
  { href: "/referrals", label: "Рефералы" }
];

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
            <header>
              <p className="text-sm font-medium text-accent">MVP</p>
              <h1 className="text-2xl font-semibold">Турнир прогнозистов</h1>
              <p className="mt-1 text-sm text-muted">
                {user.first_name ?? user.username ?? "Игрок"}, добро пожаловать.
              </p>
            </header>

            <VipStatusCard user={user} />

            <nav className="grid grid-cols-2 gap-3">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="rounded-lg bg-white px-4 py-4 text-center text-sm font-medium shadow-sm"
                >
                  {section.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-medium text-muted shadow-sm"
              onClick={logout}
            >
              Выйти из учетной записи
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
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted">VIP статус</p>
          <h2 className="mt-1 text-base font-semibold">{hasVip ? "Активен" : "Не подключен"}</h2>
          <p className="mt-1 text-sm text-muted">
            {hasVip && formattedDate
              ? `Доступ действует до ${formattedDate}.`
              : premiumUntil
                ? "VIP доступ истек."
                : "Откройте VIP, чтобы отвечать на закрытые вопросы."}
          </p>
        </div>
        <span
          className={
            hasVip
              ? "rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
              : "rounded-md bg-surface px-2 py-1 text-xs font-semibold text-muted"
          }
        >
          {hasVip ? "VIP" : "Free"}
        </span>
      </div>
      <Link className="mt-3 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" href="/vip">
        Управлять VIP
      </Link>
    </section>
  );
}
