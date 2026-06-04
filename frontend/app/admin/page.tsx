import Link from "next/link";

const adminSections = [
  { href: "/admin/seasons", label: "Сезоны" },
  { href: "/admin/tournaments", label: "Турниры" },
  { href: "/admin/matches", label: "Матчи" },
  { href: "/admin/questions", label: "Вопросы" },
  { href: "/admin/expert", label: "Эксперт" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/logs", label: "Логи" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <h1 className="text-2xl font-semibold">Админка</h1>
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
      </div>
    </main>
  );
}
