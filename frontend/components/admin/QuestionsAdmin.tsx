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
  const [publicText, setPublicText] = useState("Обе команды забьют?");
  const [vipText, setVipText] = useState("Будет пенальти?");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Match[]>("/admin/matches")
      .then((rows) => {
        setMatches(rows);
        if (rows[0]) setMatchId(String(rows[0].id));
      })
      .catch(() => setMessage("Не удалось загрузить матчи."));
  }, []);

  async function createPublicQuestion(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost("/admin/questions", { match_id: Number(matchId), text: publicText, points: 3 });
      setMessage("Общий вопрос создан.");
    } catch {
      setMessage("Не удалось создать общий вопрос. Возможно, он уже есть у матча.");
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
        <AdminField label="Матч">
          <select className={inputClassName} value={matchId} onChange={(e) => setMatchId(e.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.team_1} - {match.team_2}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Общий вопрос">
          <input className={inputClassName} value={publicText} onChange={(e) => setPublicText(e.target.value)} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать общий вопрос</button>
      </form>

      <form onSubmit={createVipQuestion} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <AdminField label="Матч">
          <select className={inputClassName} value={matchId} onChange={(e) => setMatchId(e.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.team_1} - {match.team_2}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="VIP-вопрос">
          <input className={inputClassName} value={vipText} onChange={(e) => setVipText(e.target.value)} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать VIP-вопрос</button>
      </form>

      {message ? <p className="text-sm text-muted md:col-span-2">{message}</p> : null}
    </div>
  );
}

