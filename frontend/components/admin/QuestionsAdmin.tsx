"use client";

import { useEffect, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { apiGet, apiPost } from "@/lib/api";

type Match = {
  id: number;
  team_1: string;
  team_2: string;
};

export function QuestionsAdmin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState("");
  const [publicSlot, setPublicSlot] = useState("1");
  const [publicText, setPublicText] = useState("Обе команды забьют?");
  const [vipText, setVipText] = useState("Будет пенальти?");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Match[]>("/admin/matches")
      .then((rows) => {
        setMatches(rows);
        if (rows[0]) setMatchId(String(rows[0].id));
      })
      .catch(() => setMessage("Не удалось загрузить матчи. Проверьте вход в админку."));
  }, []);

  async function createPublicQuestion(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost("/admin/questions", {
        match_id: Number(matchId),
        slot: Number(publicSlot),
        text: publicText,
        points: 3,
      });
      setMessage(`Публичный вопрос #${publicSlot} создан.`);
    } catch {
      setMessage("Не удалось создать публичный вопрос. Возможно, этот слот уже занят или у матча уже есть два публичных вопроса.");
    }
  }

  async function createVipQuestion(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost("/admin/vip-questions", { match_id: Number(matchId), text: vipText, points: 3 });
      setMessage("VIP-вопрос создан.");
    } catch {
      setMessage("Не удалось создать VIP-вопрос. Возможно, он уже есть у матча.");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form onSubmit={createPublicQuestion} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Публичный вопрос</h2>
        <AdminField label="Матч">
          <select className={inputClassName} value={matchId} onChange={(e) => setMatchId(e.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.team_1} - {match.team_2}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Номер вопроса">
          <select className={inputClassName} value={publicSlot} onChange={(e) => setPublicSlot(e.target.value)}>
            <option value="1">Публичный вопрос 1</option>
            <option value="2">Публичный вопрос 2</option>
          </select>
        </AdminField>
        <AdminField label="Текст вопроса">
          <input className={inputClassName} value={publicText} onChange={(e) => setPublicText(e.target.value)} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать публичный вопрос</button>
      </form>

      <form onSubmit={createVipQuestion} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">VIP-вопрос</h2>
        <AdminField label="Матч">
          <select className={inputClassName} value={matchId} onChange={(e) => setMatchId(e.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.team_1} - {match.team_2}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Текст вопроса">
          <input className={inputClassName} value={vipText} onChange={(e) => setVipText(e.target.value)} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать VIP-вопрос</button>
      </form>

      {message ? <p className="text-sm text-muted md:col-span-2">{message}</p> : null}
    </div>
  );
}
