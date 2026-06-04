"use client";

import { useEffect, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { apiGet, apiPost, type Match, type Question } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta } from "@/lib/matchStatus";

type Tournament = { id: number; name: string };
type MatchQuestions = {
  public_question: Question | null;
  vip_question: Question | null;
};

export function MatchesAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<MatchQuestions | null>(null);
  const [form, setForm] = useState({
    tournament_id: "",
    team_1: "",
    team_2: "",
    team_1_logo: "",
    team_2_logo: "",
    start_time: "2026-06-15T18:00",
    status: "upcoming",
  });
  const [resultForm, setResultForm] = useState({
    match_id: "",
    team_1_score: "1",
    team_2_score: "0",
    public_correct_answer: "true",
    vip_correct_answer: "true",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [tournamentRows, matchRows] = await Promise.all([
      apiGet<Tournament[]>("/admin/tournaments"),
      apiGet<Match[]>("/admin/matches"),
    ]);
    setTournaments(tournamentRows);
    setMatches(matchRows);
    if (!form.tournament_id && tournamentRows[0]) {
      setForm((current) => ({ ...current, tournament_id: String(tournamentRows[0].id) }));
    }
    if (!resultForm.match_id && matchRows[0]) {
      setResultForm((current) => ({ ...current, match_id: String(matchRows[0].id) }));
    }
  }

  async function loadQuestions(matchId: string) {
    if (!matchId) {
      setSelectedQuestions(null);
      return;
    }
    setSelectedQuestions(await apiGet<MatchQuestions>(`/admin/matches/${matchId}/questions`));
  }

  useEffect(() => {
    load().catch(() => setMessage("Не удалось загрузить матчи. Проверьте вход в админку."));
  }, []);

  useEffect(() => {
    loadQuestions(resultForm.match_id).catch(() => setSelectedQuestions(null));
  }, [resultForm.match_id]);

  async function createMatch(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost<Match>("/admin/matches", {
        ...form,
        tournament_id: Number(form.tournament_id),
        team_1_logo: form.team_1_logo || null,
        team_2_logo: form.team_2_logo || null,
        start_time: new Date(form.start_time).toISOString(),
      });
      setForm({ ...form, team_1: "", team_2: "", team_1_logo: "", team_2_logo: "" });
      setMessage("Матч создан.");
      await load();
    } catch {
      setMessage("Не удалось создать матч. Проверьте, что выбран турнир и выполнен вход в админку.");
    }
  }

  async function completeMatch(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiPost<Match>(`/admin/matches/${resultForm.match_id}/result`, {
        team_1_score: Number(resultForm.team_1_score),
        team_2_score: Number(resultForm.team_2_score),
        public_correct_answer: resultForm.public_correct_answer === "true",
        vip_correct_answer: resultForm.vip_correct_answer === "true",
      });
      setMessage("Матч завершен, баллы начислены, итоговая публикация отправлена в VIP-группу при настроенном канале.");
      await load();
      await loadQuestions(resultForm.match_id);
    } catch {
      setMessage("Не удалось завершить матч. Возможно, он уже завершен или у вопросов не хватает ответов.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_420px_1fr]">
      <form onSubmit={createMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Создать матч</h2>
        <AdminField label="Турнир">
          <select className={inputClassName} value={form.tournament_id} onChange={(e) => setForm({ ...form, tournament_id: e.target.value })}>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Команда 1">
          <input className={inputClassName} value={form.team_1} onChange={(e) => setForm({ ...form, team_1: e.target.value })} />
        </AdminField>
        <AdminField label="Команда 2">
          <input className={inputClassName} value={form.team_2} onChange={(e) => setForm({ ...form, team_2: e.target.value })} />
        </AdminField>
        <AdminField label="Лого команды 1">
          <input className={inputClassName} value={form.team_1_logo} onChange={(e) => setForm({ ...form, team_1_logo: e.target.value })} />
        </AdminField>
        <AdminField label="Лого команды 2">
          <input className={inputClassName} value={form.team_2_logo} onChange={(e) => setForm({ ...form, team_2_logo: e.target.value })} />
        </AdminField>
        <AdminField label="Время начала">
          <input type="datetime-local" className={inputClassName} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать матч</button>
      </form>

      <form onSubmit={completeMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Завершить матч и начислить баллы</h2>
        <AdminField label="Матч">
          <select
            className={inputClassName}
            value={resultForm.match_id}
            onChange={(e) => setResultForm({ ...resultForm, match_id: e.target.value })}
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.team_1} - {match.team_2}</option>
            ))}
          </select>
        </AdminField>
        <div className="grid grid-cols-2 gap-2">
          <AdminField label="Счет 1">
            <input type="number" min={0} className={inputClassName} value={resultForm.team_1_score} onChange={(e) => setResultForm({ ...resultForm, team_1_score: e.target.value })} />
          </AdminField>
          <AdminField label="Счет 2">
            <input type="number" min={0} className={inputClassName} value={resultForm.team_2_score} onChange={(e) => setResultForm({ ...resultForm, team_2_score: e.target.value })} />
          </AdminField>
        </div>
        <QuestionAnswerField
          label="Правильный ответ общего вопроса"
          questionText={selectedQuestions?.public_question?.text}
          value={resultForm.public_correct_answer}
          onChange={(value) => setResultForm({ ...resultForm, public_correct_answer: value })}
        />
        <QuestionAnswerField
          label="Правильный ответ VIP-вопроса"
          questionText={selectedQuestions?.vip_question?.text}
          value={resultForm.vip_correct_answer}
          onChange={(value) => setResultForm({ ...resultForm, vip_correct_answer: value })}
        />
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Завершить и начислить</button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </form>

      <section className="rounded-lg bg-white shadow-sm">
        {matches.map((match) => {
          const status = getMatchStatusMeta(match);
          return (
            <div key={match.id} className="border-b border-black/5 p-4 last:border-b-0">
              <div className="font-medium">{match.team_1} - {match.team_2}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span>#{match.id}</span>
                <span>tournament #{match.tournament_id}</span>
                <span>{formatMatchDate(match.start_time)}</span>
                <span className={`inline-flex items-center gap-1 ${status.textClassName}`}>
                  <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                  {status.label}
                </span>
              </div>
              {match.team_1_score !== null && match.team_2_score !== null ? (
                <div className="mt-2 text-sm">Итоговый счет: {match.team_1_score}:{match.team_2_score}</div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function QuestionAnswerField({
  label,
  questionText,
  value,
  onChange,
}: {
  label: string;
  questionText?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <AdminField label={label}>
      <div className="flex flex-col gap-2">
        <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          {questionText ?? "Вопрос для выбранного матча не задан."}
        </div>
        <select className={inputClassName} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </div>
    </AdminField>
  );
}
