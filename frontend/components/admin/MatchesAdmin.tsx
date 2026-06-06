"use client";

import { useEffect, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { TeamLogo } from "@/components/TeamLogo";
import { apiGet, apiPost, type Match, type Question } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta } from "@/lib/matchStatus";
import { worldCupTeams, type WorldCupTeam } from "@/lib/worldCupTeams";

type Tournament = { id: number; name: string };
type MatchQuestions = {
  public_questions: Question[];
  public_question: Question | null;
  vip_question: Question | null;
};

type MatchForm = {
  tournament_id: string;
  team_1: string;
  team_2: string;
  team_1_logo: string;
  team_2_logo: string;
  start_time: string;
  status: string;
};

export function MatchesAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<MatchQuestions | null>(null);
  const [form, setForm] = useState<MatchForm>({
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
    public_correct_answers: {} as Record<number, string>,
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

    const questions = await apiGet<MatchQuestions>(`/admin/matches/${matchId}/questions`);
    setSelectedQuestions(questions);
    const publicQuestions = questions.public_questions.length
      ? questions.public_questions
      : questions.public_question
        ? [questions.public_question]
        : [];
    setResultForm((current) => ({
      ...current,
      public_correct_answers: Object.fromEntries(publicQuestions.map((question) => [question.id, "true"])),
    }));
  }

  useEffect(() => {
    load().catch(() => setMessage("Не удалось загрузить матчи. Проверьте вход в админку."));
  }, []);

  useEffect(() => {
    loadQuestions(resultForm.match_id).catch(() => setSelectedQuestions(null));
  }, [resultForm.match_id]);

  function applyTeam(side: 1 | 2, team: WorldCupTeam) {
    setForm((current) => ({
      ...current,
      [`team_${side}`]: team.name,
      [`team_${side}_logo`]: team.logo,
    }));
  }

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
      setMessage("Не удалось создать матч. Проверьте, что выбран турнир, команды заполнены, и выполнен вход в админку.");
    }
  }

  async function completeMatch(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    try {
      await apiPost<Match>(`/admin/matches/${resultForm.match_id}/result`, {
        team_1_score: Number(resultForm.team_1_score),
        team_2_score: Number(resultForm.team_2_score),
        public_correct_answers: Object.fromEntries(
          Object.entries(resultForm.public_correct_answers).map(([questionId, answer]) => [questionId, answer === "true"]),
        ),
        vip_correct_answer: resultForm.vip_correct_answer === "true",
      });
      setMessage("Матч завершен, баллы начислены, публикация отправлена в VIP-группу при настроенном канале.");
      await load();
      await loadQuestions(resultForm.match_id);
    } catch {
      setMessage("Не удалось завершить матч. Возможно, он уже завершен или у вопросов не хватает ответов.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_420px_1fr]">
      <form onSubmit={createMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Создать матч</h2>
        <AdminField label="Турнир">
          <select className={inputClassName} value={form.tournament_id} onChange={(event) => setForm({ ...form, tournament_id: event.target.value })}>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </AdminField>

        <TeamSelect
          title="Команда 1"
          name={form.team_1}
          logo={form.team_1_logo}
          onPresetSelect={(team) => applyTeam(1, team)}
          onNameChange={(team_1) => setForm({ ...form, team_1 })}
          onLogoChange={(team_1_logo) => setForm({ ...form, team_1_logo })}
        />
        <TeamSelect
          title="Команда 2"
          name={form.team_2}
          logo={form.team_2_logo}
          onPresetSelect={(team) => applyTeam(2, team)}
          onNameChange={(team_2) => setForm({ ...form, team_2 })}
          onLogoChange={(team_2_logo) => setForm({ ...form, team_2_logo })}
        />

        <AdminField label="Время начала">
          <input type="datetime-local" className={inputClassName} value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Создать матч</button>
      </form>

      <form onSubmit={completeMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Завершить матч и начислить баллы</h2>
        <AdminField label="Матч">
          <select
            className={inputClassName}
            value={resultForm.match_id}
            onChange={(event) => setResultForm({ ...resultForm, match_id: event.target.value })}
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {formatQuestionReadiness(match)} · {match.team_1} - {match.team_2}
              </option>
            ))}
          </select>
        </AdminField>
        <div className="grid grid-cols-2 gap-2">
          <AdminField label="Счет 1">
            <input type="number" min={0} className={inputClassName} value={resultForm.team_1_score} onChange={(event) => setResultForm({ ...resultForm, team_1_score: event.target.value })} />
          </AdminField>
          <AdminField label="Счет 2">
            <input type="number" min={0} className={inputClassName} value={resultForm.team_2_score} onChange={(event) => setResultForm({ ...resultForm, team_2_score: event.target.value })} />
          </AdminField>
        </div>
        {(selectedQuestions?.public_questions.length
          ? selectedQuestions.public_questions
          : selectedQuestions?.public_question
            ? [selectedQuestions.public_question]
            : []
        ).map((question) => (
          <QuestionAnswerField
            key={question.id}
            label={`Правильный ответ публичного вопроса ${question.slot}`}
            questionText={question.text}
            value={resultForm.public_correct_answers[question.id] ?? "true"}
            onChange={(value) =>
              setResultForm({
                ...resultForm,
                public_correct_answers: { ...resultForm.public_correct_answers, [question.id]: value },
              })
            }
          />
        ))}
        {selectedQuestions && selectedQuestions.public_questions.length === 0 && !selectedQuestions.public_question ? (
          <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">Публичные вопросы для выбранного матча не заданы.</div>
        ) : null}
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
              <div className="flex items-center gap-3 font-medium">
                <TeamLogo logo={match.team_1_logo} name={match.team_1} size="sm" />
                <span className="min-w-0">{match.team_1} - {match.team_2}</span>
                <TeamLogo logo={match.team_2_logo} name={match.team_2} size="sm" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span>#{match.id}</span>
                <span>tournament #{match.tournament_id}</span>
                <span>{formatMatchDate(match.start_time)}</span>
                <span className={`inline-flex items-center gap-1 ${status.textClassName}`}>
                  <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                  {status.label}
                </span>
                <QuestionReadinessBadge match={match} />
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

function TeamSelect({
  title,
  name,
  logo,
  onPresetSelect,
  onNameChange,
  onLogoChange,
}: {
  title: string;
  name: string;
  logo: string;
  onPresetSelect: (team: WorldCupTeam) => void;
  onNameChange: (value: string) => void;
  onLogoChange: (value: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-md border border-black/5 bg-surface p-3">
      <div className="flex items-center gap-3">
        <TeamLogo logo={logo} name={name || title} />
        <div className="text-sm font-medium">{title}</div>
      </div>
      <AdminField label="Выбрать из ЧМ-2026">
        <select
          className={inputClassName}
          value={worldCupTeams.some((team) => team.name === name) ? name : ""}
          onChange={(event) => {
            const team = worldCupTeams.find((item) => item.name === event.target.value);
            if (team) {
              onPresetSelect(team);
            }
          }}
        >
          <option value="">Выберите команду</option>
          {worldCupTeams.map((team) => (
            <option key={`${team.confederation}-${team.name}`} value={team.name}>
              {team.logo} {team.name} · {team.confederation}
            </option>
          ))}
        </select>
      </AdminField>
      <AdminField label="Название">
        <input className={inputClassName} value={name} onChange={(event) => onNameChange(event.target.value)} />
      </AdminField>
      <AdminField label="Значок или URL логотипа">
        <input className={inputClassName} value={logo} onChange={(event) => onLogoChange(event.target.value)} />
      </AdminField>
    </section>
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
        <select className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </div>
    </AdminField>
  );
}

function formatQuestionReadiness(match: Match): string {
  const publicCount = match.public_questions_count ?? 0;
  const vipReady = Boolean(match.vip_question_exists);
  return publicCount >= 2 && vipReady ? "вопросы OK" : `вопросы ${publicCount}/2${vipReady ? " + VIP" : ""}`;
}

function QuestionReadinessBadge({ match }: { match: Match }) {
  const publicCount = match.public_questions_count ?? 0;
  const vipReady = Boolean(match.vip_question_exists);
  const isComplete = Boolean(match.questions_complete);

  return (
    <span
      className={
        isComplete
          ? "inline-flex rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
          : "inline-flex rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
      }
    >
      {isComplete ? "Вопросы заполнены" : `Вопросы: ${publicCount}/2, VIP ${vipReady ? "есть" : "нет"}`}
    </span>
  );
}
