import Link from "next/link";

export function LocalAuthNotice() {
  return (
    <div className="rounded-lg bg-white p-4 text-sm shadow-sm">
      <p className="text-muted">Для локального теста сначала войдите как тестовый пользователь.</p>
      <Link className="mt-3 inline-flex rounded-md bg-ink px-4 py-2 font-medium text-white" href="/dev-login">
        Локальный вход
      </Link>
    </div>
  );
}

