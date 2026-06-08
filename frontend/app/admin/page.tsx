"use client";

import Link from "next/link";

import { AdminAccessGate } from "@/components/admin/AdminAccessGate";

const adminSections = [
  { href: "/admin/seasons", label: "Сезоны" },
  { href: "/admin/tournaments", label: "Турниры" },
  { href: "/admin/tournament-predictions", label: "Турнирные прогнозы" },
  { href: "/admin/matches", label: "Матчи" },
  { href: "/admin/questions", label: "Вопросы" },
  { href: "/admin/expert", label: "Эксперт" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/logs", label: "Логи" },
];

export default function AdminPage() {
  function logout() {
    sessionStorage.removeItem("access_token");
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">Админка</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-md bg-white px-3 py-2 text-sm shadow-sm">
              Приложение
            </Link>
            <button type="button" onClick={logout} className="rounded-md bg-white px-3 py-2 text-sm shadow-sm">
              Выйти
            </button>
          </div>
        </header>
        <AdminAccessGate>
          <nav className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {adminSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-lg bg-white px-4 py-4 text-center text-sm font-medium shadow-sm"
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </AdminAccessGate>
      </div>
    </main>
  );
}
