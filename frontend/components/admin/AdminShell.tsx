import Link from "next/link";

const nav = [
  { href: "/admin/seasons", label: "Сезоны" },
  { href: "/admin/tournaments", label: "Турниры" },
  { href: "/admin/matches", label: "Матчи" },
  { href: "/admin/questions", label: "Вопросы" },
  { href: "/admin/expert", label: "Эксперт" },
  { href: "/admin/logs", label: "Логи" }
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
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
        </header>
        {children}
      </div>
    </main>
  );
}

