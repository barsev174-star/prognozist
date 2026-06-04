"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authenticateDev } from "@/lib/api";

export default function DevLoginPage() {
  const [telegramId, setTelegramId] = useState("12345");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function login() {
    setError(null);
    try {
      const response = await authenticateDev(Number(telegramId));
      sessionStorage.setItem("access_token", response.access_token);
      router.push("/admin");
    } catch {
      setError("Не удалось войти. Проверьте, что backend запущен и ENVIRONMENT=local.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-sm flex-col gap-4 rounded-lg bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Локальный вход</h1>
        <label className="flex flex-col gap-2 text-sm">
          Telegram ID
          <input
            className="rounded-md border border-black/10 px-3 py-2"
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
