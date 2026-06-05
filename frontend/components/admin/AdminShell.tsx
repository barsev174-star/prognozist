"use client";

import Link from "next/link";

import { AdminAccessGate } from "@/components/admin/AdminAccessGate";

const nav = [
  { href: "/admin/seasons", label: "Сезоны" },
  { href: "/admin/tournaments", label: "Турниры" },
  { href: "/admin/matches", label: "Матчи" },
  { href: "/admin/questions", label: "Вопросы" },
  { href: "/admin/expert", label: "Эксперт" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/logs", label: "Логи" },
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  function logout() {
    sessionStorage.removeItem("access_token");
    window.location.href = "/dev-login";
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-3">
          <Link href="/admin" className="text-sm text-muted">
            Админка
          </Link>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <nav className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md bg-white px-3 py-2 text-sm shadow-sm">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users" className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white shadow-sm">
              Пользователи
            </Link>
            <Link href="/" className="rounded-md bg-white px-3 py-2 text-sm shadow-sm">
              Приложение
            </Link>
            <button type="button" onClick={logout} className="rounded-md bg-white px-3 py-2 text-sm shadow-sm">
              Выйти
            </button>
          </div>
        </header>
        <AdminAccessGate>{children}</AdminAccessGate>
      </div>
    </main>
  );
}
