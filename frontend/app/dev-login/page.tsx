"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authenticateDev } from "@/lib/api";

export default function DevLoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function login(nextPath: string) {
    setError(null);

    const numericTelegramId = Number(telegramId);
    if (!Number.isInteger(numericTelegramId) || numericTelegramId <= 0) {
      setError("Введите Telegram ID числом.");
      return;
    }

    try {
      const response = await authenticateDev(numericTelegramId, {
        username: `player_${numericTelegramId}`,
        first_name: playerName || `Игрок ${numericTelegramId}`,
      });
      sessionStorage.setItem("access_token", response.access_token);
      router.push(nextPath);
    } catch {
      setError("Не удалось войти. Проверьте, что backend запущен.");
    }
  }

  function fillRandomPlayerId() {
    const names = ["Алексей", "Мария", "Иван", "Ольга", "Дмитрий", "Анна", "Сергей", "Наталья", "Павел", "Елена"];
    const id = Math.floor(100000 + Math.random() * 900000);
    const name = names[Math.floor(Math.random() * names.length)];
    setTelegramId(String(id));
    setPlayerName(`${name} ${String(id).slice(-3)}`);
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-sm flex-col gap-4 rounded-lg bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Локальный вход</h1>
        <p className="text-sm text-muted">
          Для теста можно войти обычным игроком с любым Telegram ID. Для админки используйте ID администратора из `.env`.
        </p>

        <label className="flex flex-col gap-2 text-sm">
          Telegram ID
          <input
            className="rounded-md border border-black/10 px-3 py-2"
            inputMode="numeric"
            placeholder="Например: 12345"
            value={telegramId}
            onChange={(event) => setTelegramId(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Имя игрока
          <input
            className="rounded-md border border-black/10 px-3 py-2"
            placeholder="Например: Алексей 123"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />
        </label>

        <button type="button" className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium" onClick={fillRandomPlayerId}>
          Случайный игрок
        </button>
        <button type="button" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" onClick={() => login("/")}>
          Войти как игрок
        </button>
        <button type="button" className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium" onClick={() => login("/admin")}>
          Войти в админку
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </main>
  );
}
