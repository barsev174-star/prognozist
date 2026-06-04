"use client";

import Link from "next/link";

import { AuthGate } from "@/components/AuthGate";

const sections = [
  { href: "/matches", label: "Матчи" },
  { href: "/rankings", label: "Рейтинг" },
  { href: "/leagues", label: "Лиги" },
  { href: "/profile", label: "Профиль" },
  { href: "/vip", label: "VIP" },
  { href: "/referrals", label: "Рефералы" }
];

export default function HomePage() {
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
          </div>
        </main>
      )}
    </AuthGate>
  );
}

