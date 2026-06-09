"use client";

import { useEffect, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { TeamLogo } from "@/components/TeamLogo";
import { apiGet, apiPost, type Match, type Question, type Team, type TeamSeedSummary, type Tournament } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta } from "@/lib/matchStatus";

type MatchQuestions = {
  public_questions: Question[];
  public_question: Question | null;
  vip_question: Question | null;
};

type MatchForm = {
  tournament_id: string;
  team_1_id: string;
  team_2_id: string;
  team_1: string;
  team_2: string;
  team_1_logo: string;
  team_2_logo: string;
  start_time: string;
  status: string;
};

const text = {
  loadError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043c\u0430\u0442\u0447\u0438. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0432\u0445\u043e\u0434 \u0432 \u0430\u0434\u043c\u0438\u043d\u043a\u0443.",
  createSuccess: "\u041c\u0430\u0442\u0447 \u0441\u043e\u0437\u0434\u0430\u043d.",
  createError:
    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0442\u0447. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0442\u0443\u0440\u043d\u0438\u0440, \u043a\u043e\u043c\u0430\u043d\u0434\u044b \u0438 \u0432\u0445\u043e\u0434 \u0432 \u0430\u0434\u043c\u0438\u043d\u043a\u0443.",
  completeSuccess:
    "\u041c\u0430\u0442\u0447 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d, \u0431\u0430\u043b\u043b\u044b \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u044b. \u0415\u0441\u043b\u0438 VIP-\u0433\u0440\u0443\u043f\u043f\u0430 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0430, \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u0430 \u0443\u0436\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430.",
  completeError:
    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u043c\u0430\u0442\u0447. \u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e, \u043e\u043d \u0443\u0436\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d \u0438\u043b\u0438 \u0434\u043b\u044f \u0432\u043e\u043f\u0440\u043e\u0441\u043e\u0432 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d\u044b \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0435 \u043e\u0442\u0432\u0435\u0442\u044b.",
  seedSuccess:
    "\u0421\u043f\u0438\u0441\u043e\u043a \u0441\u0431\u043e\u0440\u043d\u044b\u0445 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d. \u0422\u0435\u043f\u0435\u0440\u044c \u043a\u043e\u043c\u0430\u043d\u0434\u044b \u043c\u043e\u0436\u043d\u043e \u0432\u044b\u0431\u0438\u0440\u0430\u0442\u044c \u0438\u0437 \u0432\u044b\u043f\u0430\u0434\u0430\u044e\u0449\u0435\u0433\u043e \u0441\u043f\u0438\u0441\u043a\u0430.",
  seedError:
    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u043f\u0438\u0441\u043e\u043a \u0441\u0431\u043e\u0440\u043d\u044b\u0445. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0431\u044d\u043a\u0435\u043d\u0434 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.",
  createTitle: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0442\u0447",
  tournament: "\u0422\u0443\u0440\u043d\u0438\u0440",
  emptyTeamsTitle: "\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a \u0441\u0431\u043e\u0440\u043d\u044b\u0445 \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u043e\u0439.",
  emptyTeamsBody:
    "\u041c\u043e\u0436\u043d\u043e \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u0432\u0440\u0443\u0447\u043d\u0443\u044e, \u043d\u043e \u0443\u0434\u043e\u0431\u043d\u0435\u0435 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u043a\u043e\u043c\u0430\u043d\u0434 \u0434\u043b\u044f \u0427\u041c-2026.",
  seedButton: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u0431\u043e\u0440\u043d\u044b\u0435 \u0427\u041c-2026",
  seedButtonLoading: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u043a\u043e\u043c\u0430\u043d\u0434\u044b...",
  seedRefreshButton: "\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a \u0441\u0431\u043e\u0440\u043d\u044b\u0445",
  team1: "\u041a\u043e\u043c\u0430\u043d\u0434\u0430 1",
  team2: "\u041a\u043e\u043c\u0430\u043d\u0434\u0430 2",
  startTime: "\u0412\u0440\u0435\u043c\u044f \u043d\u0430\u0447\u0430\u043b\u0430",
  createButton: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0442\u0447",
  completeTitle: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u043c\u0430\u0442\u0447 \u0438 \u043d\u0430\u0447\u0438\u0441\u043b\u0438\u0442\u044c \u0431\u0430\u043b\u043b\u044b",
  match: "\u041c\u0430\u0442\u0447",
  finalScore: "\u0418\u0442\u043e\u0433\u043e\u0432\u044b\u0439 \u0441\u0447\u0435\u0442",
  completeLocked:
    "\u041f\u043e\u0432\u0442\u043e\u0440\u043d\u043e\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u0435 \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u043e.",
  completeHint:
    "\u041c\u0430\u0442\u0447 \u0435\u0449\u0435 \u043c\u043e\u0436\u043d\u043e \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u043f\u043e\u0441\u043b\u0435 \u0432\u043d\u0435\u0441\u0435\u043d\u0438\u044f \u0438\u0442\u043e\u0433\u043e\u0432\u043e\u0433\u043e \u0441\u0447\u0435\u0442\u0430 \u0438 \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0445 \u043e\u0442\u0432\u0435\u0442\u043e\u0432.",
  score1: "\u0421\u0447\u0435\u0442 1",
  score2: "\u0421\u0447\u0435\u0442 2",
  publicAnswerPrefix: "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0432\u0435\u0442 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u0433\u043e \u0432\u043e\u043f\u0440\u043e\u0441\u0430",
  noPublicQuestions: "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0434\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u043c\u0430\u0442\u0447\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u044b.",
  vipAnswer: "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0432\u0435\u0442 VIP-\u0432\u043e\u043f\u0440\u043e\u0441\u0430",
  completedButton: "\u041c\u0430\u0442\u0447 \u0443\u0436\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d",
  completeButton: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u0438 \u043d\u0430\u0447\u0438\u0441\u043b\u0438\u0442\u044c",
  teamPicker: "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u0437 \u0441\u043f\u0438\u0441\u043a\u0430 \u0441\u0431\u043e\u0440\u043d\u044b\u0445",
  chooseTeam: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0443",
  teamName: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
  teamLogo: "\u041b\u043e\u0433\u043e\u0442\u0438\u043f, \u044d\u043c\u043e\u0434\u0437\u0438 \u0438\u043b\u0438 URL",
  noQuestionYet: "\u0412\u043e\u043f\u0440\u043e\u0441 \u0434\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u043c\u0430\u0442\u0447\u0430 \u0435\u0449\u0435 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d.",
  yes: "\u0414\u0430",
  no: "\u041d\u0435\u0442",
  questionsOk: "\u0412\u043e\u043f\u0440\u043e\u0441\u044b OK",
  questionsPrefix: "\u0412\u043e\u043f\u0440\u043e\u0441\u044b",
  questionsConfigured: "\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u044b",
  vipExists: "\u0435\u0441\u0442\u044c",
  vipMissing: "\u043d\u0435\u0442",
};

export function MatchesAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<MatchQuestions | null>(null);
  const [isSeedingTeams, setIsSeedingTeams] = useState(false);
  const [form, setForm] = useState<MatchForm>({
    tournament_id: "",
    team_1_id: "",
    team_2_id: "",
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
    const [tournamentRows, teamRows, matchRows] = await Promise.all([
      apiGet<Tournament[]>("/admin/tournaments"),
      apiGet<Team[]>("/admin/teams"),
      apiGet<Match[]>("/admin/matches"),
    ]);
    setTournaments(tournamentRows);
    setTeams(teamRows);
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
    load().catch(() => setMessage(text.loadError));
  }, []);

  useEffect(() => {
    loadQuestions(resultForm.match_id).catch(() => setSelectedQuestions(null));
  }, [resultForm.match_id]);

  function applyTeam(side: 1 | 2, team: Team) {
    setForm((current) => ({
      ...current,
      [`team_${side}_id`]: String(team.id),
      [`team_${side}`]: team.name,
      [`team_${side}_logo`]: team.logo_url || team.flag_emoji || "",
    }));
  }

  async function createMatch(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    try {
      await apiPost<Match>("/admin/matches", {
        ...form,
        tournament_id: Number(form.tournament_id),
        team_1_id: form.team_1_id ? Number(form.team_1_id) : null,
        team_2_id: form.team_2_id ? Number(form.team_2_id) : null,
        team_1_logo: form.team_1_logo || null,
        team_2_logo: form.team_2_logo || null,
        start_time: new Date(form.start_time).toISOString(),
      });
      setForm((current) => ({
        ...current,
        team_1_id: "",
        team_2_id: "",
        team_1: "",
        team_2: "",
        team_1_logo: "",
        team_2_logo: "",
      }));
      setMessage(text.createSuccess);
      await load();
    } catch {
      setMessage(text.createError);
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
      setMessage(text.completeSuccess);
      await load();
      await loadQuestions(resultForm.match_id);
    } catch {
      setMessage(text.completeError);
    }
  }

  async function seedTeams() {
    setIsSeedingTeams(true);
    setMessage(null);
    try {
      await apiPost<TeamSeedSummary>("/admin/teams/seed-world-cup-2026");
      await load();
      setMessage(text.seedSuccess);
    } catch {
      setMessage(text.seedError);
    } finally {
      setIsSeedingTeams(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_420px_1fr]">
      <form onSubmit={createMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">{text.createTitle}</h2>
        <AdminField label={text.tournament}>
          <select className={inputClassName} value={form.tournament_id} onChange={(event) => setForm({ ...form, tournament_id: event.target.value })}>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </AdminField>

        <button
          type="button"
          onClick={seedTeams}
          disabled={isSeedingTeams}
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink disabled:opacity-60"
        >
          {isSeedingTeams ? text.seedButtonLoading : text.seedRefreshButton}
        </button>

        {teams.length === 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <p>{text.emptyTeamsTitle}</p>
            <p className="mt-1">{text.emptyTeamsBody}</p>
            <button
              type="button"
              onClick={seedTeams}
              disabled={isSeedingTeams}
              className="mt-3 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSeedingTeams ? text.seedButtonLoading : text.seedButton}
            </button>
          </div>
        ) : null}

        <TeamSelect
          title={text.team1}
          teams={teams}
          selectedTeamId={form.team_1_id}
          name={form.team_1}
          logo={form.team_1_logo}
          onPresetSelect={(team) => applyTeam(1, team)}
          onNameChange={(team_1) => setForm({ ...form, team_1_id: "", team_1 })}
          onLogoChange={(team_1_logo) => setForm({ ...form, team_1_logo })}
        />
        <TeamSelect
          title={text.team2}
          teams={teams}
          selectedTeamId={form.team_2_id}
          name={form.team_2}
          logo={form.team_2_logo}
          onPresetSelect={(team) => applyTeam(2, team)}
          onNameChange={(team_2) => setForm({ ...form, team_2_id: "", team_2 })}
          onLogoChange={(team_2_logo) => setForm({ ...form, team_2_logo })}
        />

        <AdminField label={text.startTime}>
          <input type="datetime-local" className={inputClassName} value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
        </AdminField>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">{text.createButton}</button>
      </form>

      <form onSubmit={completeMatch} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">{text.completeTitle}</h2>
        <AdminField label={text.match}>
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
                {text.finalScore}: {selectedResultMatch.team_1_score}:{selectedResultMatch.team_2_score}. {text.completeLocked}
              </div>
            ) : (
              <div className="mt-1">{text.completeHint}</div>
            )}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <AdminField label={text.score1}>
            <input type="number" min={0} className={inputClassName} value={resultForm.team_1_score} disabled={isSelectedResultCompleted} onChange={(event) => setResultForm({ ...resultForm, team_1_score: event.target.value })} />
          </AdminField>
          <AdminField label={text.score2}>
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
            label={`${text.publicAnswerPrefix} ${question.slot}`}
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
          <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">{text.noPublicQuestions}</div>
        ) : null}
        <QuestionAnswerField
          label={text.vipAnswer}
          questionText={selectedQuestions?.vip_question?.text}
          value={resultForm.vip_correct_answer}
          disabled={isSelectedResultCompleted}
          onChange={(value) => setResultForm({ ...resultForm, vip_correct_answer: value })}
        />
        <button disabled={isSelectedResultCompleted} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isSelectedResultCompleted ? text.completedButton : text.completeButton}
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
                <span className="min-w-0">
                  {match.team_1} - {match.team_2}
                </span>
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
                <div className="mt-2 text-sm">
                  {text.finalScore}: {match.team_1_score}:{match.team_2_score}
                </div>
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
  teams,
  selectedTeamId,
  name,
  logo,
  onPresetSelect,
  onNameChange,
  onLogoChange,
}: {
  title: string;
  teams: Team[];
  selectedTeamId: string;
  name: string;
  logo: string;
  onPresetSelect: (team: Team) => void;
  onNameChange: (value: string) => void;
  onLogoChange: (value: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-md border border-black/5 bg-surface p-3">
      <div className="flex items-center gap-3">
        <TeamLogo logo={logo} name={name || title} />
        <div className="text-sm font-medium">{title}</div>
      </div>
      <AdminField label={text.teamPicker}>
        <select
          className={inputClassName}
          value={selectedTeamId}
          onChange={(event) => {
            const team = teams.find((item) => String(item.id) === event.target.value);
            if (team) {
              onPresetSelect(team);
            }
          }}
        >
          <option value="">{text.chooseTeam}</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {(team.flag_emoji ?? team.logo_url ?? "")} {team.name} - {(team.fifa_code ?? team.confederation).toUpperCase()}
            </option>
          ))}
        </select>
      </AdminField>
      <AdminField label={text.teamName}>
        <input className={inputClassName} value={name} onChange={(event) => onNameChange(event.target.value)} />
      </AdminField>
      <AdminField label={text.teamLogo}>
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
        <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">{questionText ?? text.noQuestionYet}</div>
        <select className={inputClassName} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          <option value="true">{text.yes}</option>
          <option value="false">{text.no}</option>
        </select>
      </div>
    </AdminField>
  );
}

function formatQuestionReadiness(match: Match): string {
  const publicCount = match.public_questions_count ?? 0;
  const vipReady = Boolean(match.vip_question_exists);
  return publicCount >= 2 && vipReady ? text.questionsOk : `${text.questionsPrefix} ${publicCount}/2${vipReady ? " + VIP" : ""}`;
}

function formatAdminMatchOptionWithStatus(match: Match): string {
  const status = getMatchStatusMeta(match);
  return `${status.label} - ${formatQuestionReadiness(match)} - ${match.team_1} - ${match.team_2}`;
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
      {isComplete ? text.questionsConfigured : `${text.questionsPrefix}: ${publicCount}/2, VIP ${vipReady ? text.vipExists : text.vipMissing}`}
    </span>
  );
}
