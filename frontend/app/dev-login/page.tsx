"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authenticateDev } from "@/lib/api";

export default function DevLoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function login() {
    setError(null);
    try {
      const response = await authenticateDev(Number(telegramId));
      sessionStorage.setItem("access_token", response.access_token);
      router.push("/admin");
    } catch {
      setError("Не удалось войти. Проверьте, что backend запущен, ENVIRONMENT=local, а Telegram ID указан в TELEGRAM_ADMIN_IDS.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-sm flex-col gap-4 rounded-lg bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Локальный вход</h1>
        <p className="text-sm text-muted">
          Для доступа к админке введите Telegram ID администратора из `.env`.
        </p>
        <label className="flex flex-col gap-2 text-sm">
          Telegram ID
          <input
            className="rounded-md border border-black/10 px-3 py-2"
            inputMode="numeric"
            placeholder="Например: 1321200291"
            value={telegramId}
            onChange={(event) => setTelegramId(event.target.value)}
          />
        </label>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" onClick={login}>
          Войти в админку
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </main>
  );
}
