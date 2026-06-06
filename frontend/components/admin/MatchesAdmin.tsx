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
  const selectedResultMatch = matches.find((match) => String(match.id) === resultForm.match_id) ?? null;
  const selectedResultStatus = selectedResultMatch ? getMatchStatusMeta(selectedResultMatch) : null;
  const isSelectedResultCompleted = selectedResultMatch?.status === "completed";

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
    load().catch(() => setMessage("РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РјР°С‚С‡Рё. РџСЂРѕРІРµСЂСЊС‚Рµ РІС…РѕРґ РІ Р°РґРјРёРЅРєСѓ."));
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
      setMessage("РњР°С‚С‡ СЃРѕР·РґР°РЅ.");
      await load();
    } catch {
      setMessage("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ РјР°С‚С‡. РџСЂРѕРІРµСЂСЊС‚Рµ, С‡С‚Рѕ РІС‹Р±СЂР°РЅ С‚СѓСЂРЅРёСЂ, РєРѕРјР°РЅРґС‹ Р·Р°РїРѕР»РЅРµРЅС‹, Рё РІС‹РїРѕР»РЅРµРЅ РІС…РѕРґ РІ Р°РґРјРёРЅРєСѓ.");
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
      setMessage("РњР°С‚С‡ Р·Р°РІРµСЂС€РµРЅ, Р±Р°Р»Р»С‹ РЅР°С‡РёСЃР»РµРЅС‹, РїСѓР±Р»РёРєР°С†РёСЏ РѕС‚РїСЂР°РІР»РµРЅР° РІ VIP-РіСЂСѓРїРїСѓ РїСЂРё РЅР°СЃС‚СЂРѕРµРЅРЅРѕРј РєР°РЅР°Р»Рµ.");
      await load();
      await loadQuestions(resultForm.match_id);
    } catch {
      setMessage("РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РІРµСЂС€РёС‚СЊ РјР°С‚С‡. Р’РѕР·РјРѕР¶РЅРѕ, РѕРЅ СѓР¶Рµ Р·Р°РІРµСЂС€РµРЅ РёР»Рё Сѓ РІРѕРїСЂРѕСЃРѕРІ РЅРµ С…РІР°С‚Р°РµС‚ РѕС‚РІРµС‚РѕРІ.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_420px_1fr]">
      <form onSubmit={createMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">РЎРѕР·РґР°С‚СЊ РјР°С‚С‡</h2>
        <AdminField label="РўСѓСЂРЅРёСЂ">
          <select className={inputClassName} value={form.tournament_id} onChange={(event) => setForm({ ...form, tournament_id: event.target.value })}>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </AdminField>

        <TeamSelect
          title="РљРѕРјР°РЅРґР° 1"
          name={form.team_1}
          logo={form.team_1_logo}
          onPresetSelect={(team) => applyTeam(1, team)}
          onNameChange={(team_1) => setForm({ ...form, team_1 })}
          onLogoChange={(team_1_logo) => setForm({ ...form, team_1_logo })}
        />
        <TeamSelect
          title="РљРѕРјР°РЅРґР° 2"
          name={form.team_2}
          logo={form.team_2_logo}
          onPresetSelect={(team) => applyTeam(2, team)}
          onNameChange={(team_2) => setForm({ ...form, team_2 })}
          onLogoChange={(team_2_logo) => setForm({ ...form, team_2_logo })}
        />

        <AdminField label="Р’СЂРµРјСЏ РЅР°С‡Р°Р»Р°">
          <input type="datetime-local" className={inputClassName} value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">РЎРѕР·РґР°С‚СЊ РјР°С‚С‡</button>
      </form>

      <form onSubmit={completeMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Р—Р°РІРµСЂС€РёС‚СЊ РјР°С‚С‡ Рё РЅР°С‡РёСЃР»РёС‚СЊ Р±Р°Р»Р»С‹</h2>
        <AdminField label="РњР°С‚С‡">
          <select
            className={inputClassName}
            value={resultForm.match_id}
            onChange={(event) => setResultForm({ ...resultForm, match_id: event.target.value })}
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {formatAdminMatchOptionWithStatus(match)}
              </option>
            ))}
          </select>
        </AdminField>
        {selectedResultMatch && selectedResultStatus ? (
          <div
            className={
              isSelectedResultCompleted
                ? "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900"
                : "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            }
          >
            <div className="flex items-center gap-2 font-medium">
              <span className={`h-2 w-2 rounded-full ${selectedResultStatus.dotClassName}`} />
              {selectedResultStatus.label}
            </div>
            {isSelectedResultCompleted && selectedResultMatch.team_1_score !== null && selectedResultMatch.team_2_score !== null ? (
              <div className="mt-1">
                РС‚РѕРіРѕРІС‹Р№ СЃС‡РµС‚: {selectedResultMatch.team_1_score}:{selectedResultMatch.team_2_score}. РџРѕРІС‚РѕСЂРЅРѕРµ Р·Р°РІРµСЂС€РµРЅРёРµ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРѕ.
              </div>
            ) : (
              <div className="mt-1">РњР°С‚С‡ РµС‰Рµ РјРѕР¶РЅРѕ Р·Р°РІРµСЂС€РёС‚СЊ РїРѕСЃР»Рµ РІРЅРµСЃРµРЅРёСЏ РёС‚РѕРіРѕРІРѕРіРѕ СЃС‡РµС‚Р° Рё РїСЂР°РІРёР»СЊРЅС‹С… РѕС‚РІРµС‚РѕРІ.</div>
            )}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <AdminField label="РЎС‡РµС‚ 1">
            <input type="number" min={0} className={inputClassName} value={resultForm.team_1_score} disabled={isSelectedResultCompleted} onChange={(event) => setResultForm({ ...resultForm, team_1_score: event.target.value })} />
          </AdminField>
          <AdminField label="РЎС‡РµС‚ 2">
            <input type="number" min={0} className={inputClassName} value={resultForm.team_2_score} disabled={isSelectedResultCompleted} onChange={(event) => setResultForm({ ...resultForm, team_2_score: event.target.value })} />
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
            label={`РџСЂР°РІРёР»СЊРЅС‹Р№ РѕС‚РІРµС‚ РїСѓР±Р»РёС‡РЅРѕРіРѕ РІРѕРїСЂРѕСЃР° ${question.slot}`}
            questionText={question.text}
            value={resultForm.public_correct_answers[question.id] ?? "true"}
            disabled={isSelectedResultCompleted}
            onChange={(value) =>
              setResultForm({
                ...resultForm,
                public_correct_answers: { ...resultForm.public_correct_answers, [question.id]: value },
              })
            }
          />
        ))}
        {selectedQuestions && selectedQuestions.public_questions.length === 0 && !selectedQuestions.public_question ? (
          <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">РџСѓР±Р»РёС‡РЅС‹Рµ РІРѕРїСЂРѕСЃС‹ РґР»СЏ РІС‹Р±СЂР°РЅРЅРѕРіРѕ РјР°С‚С‡Р° РЅРµ Р·Р°РґР°РЅС‹.</div>
        ) : null}
        <QuestionAnswerField
          label="РџСЂР°РІРёР»СЊРЅС‹Р№ РѕС‚РІРµС‚ VIP-РІРѕРїСЂРѕСЃР°"
          questionText={selectedQuestions?.vip_question?.text}
          value={resultForm.vip_correct_answer}
          disabled={isSelectedResultCompleted}
          onChange={(value) => setResultForm({ ...resultForm, vip_correct_answer: value })}
        />
        <button disabled={isSelectedResultCompleted} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isSelectedResultCompleted ? "РњР°С‚С‡ СѓР¶Рµ Р·Р°РІРµСЂС€РµРЅ" : "Р—Р°РІРµСЂС€РёС‚СЊ Рё РЅР°С‡РёСЃР»РёС‚СЊ"}
        </button>
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
                <div className="mt-2 text-sm">РС‚РѕРіРѕРІС‹Р№ СЃС‡РµС‚: {match.team_1_score}:{match.team_2_score}</div>
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
      <AdminField label="Р’С‹Р±СЂР°С‚СЊ РёР· Р§Рњ-2026">
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
          <option value="">Р’С‹Р±РµСЂРёС‚Рµ РєРѕРјР°РЅРґСѓ</option>
          {worldCupTeams.map((team) => (
            <option key={`${team.confederation}-${team.name}`} value={team.name}>
              {team.logo} {team.name} В· {team.confederation}
            </option>
          ))}
        </select>
      </AdminField>
      <AdminField label="РќР°Р·РІР°РЅРёРµ">
        <input className={inputClassName} value={name} onChange={(event) => onNameChange(event.target.value)} />
      </AdminField>
      <AdminField label="Р—РЅР°С‡РѕРє РёР»Рё URL Р»РѕРіРѕС‚РёРїР°">
        <input className={inputClassName} value={logo} onChange={(event) => onLogoChange(event.target.value)} />
      </AdminField>
    </section>
  );
}

function QuestionAnswerField({
  label,
  questionText,
  value,
  disabled,
  onChange,
}: {
  label: string;
  questionText?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <AdminField label={label}>
      <div className="flex flex-col gap-2">
        <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          {questionText ?? "Р’РѕРїСЂРѕСЃ РґР»СЏ РІС‹Р±СЂР°РЅРЅРѕРіРѕ РјР°С‚С‡Р° РЅРµ Р·Р°РґР°РЅ."}
        </div>
        <select className={inputClassName} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          <option value="true">Р”Р°</option>
          <option value="false">РќРµС‚</option>
        </select>
      </div>
    </AdminField>
  );
}

function formatQuestionReadiness(match: Match): string {
  const publicCount = match.public_questions_count ?? 0;
  const vipReady = Boolean(match.vip_question_exists);
  return publicCount >= 2 && vipReady ? "РІРѕРїСЂРѕСЃС‹ OK" : `РІРѕРїСЂРѕСЃС‹ ${publicCount}/2${vipReady ? " + VIP" : ""}`;
}

function formatAdminMatchOptionWithStatus(match: Match): string {
  const status = getMatchStatusMeta(match);
  return `${status.label} · ${formatQuestionReadiness(match)} · ${match.team_1} - ${match.team_2}`;
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
      {isComplete ? "Р’РѕРїСЂРѕСЃС‹ Р·Р°РїРѕР»РЅРµРЅС‹" : `Р’РѕРїСЂРѕСЃС‹: ${publicCount}/2, VIP ${vipReady ? "РµСЃС‚СЊ" : "РЅРµС‚"}`}
    </span>
  );
}
