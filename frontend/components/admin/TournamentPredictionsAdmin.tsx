"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import {
  apiGet,
  apiPatch,
  apiPost,
  type Team,
  type Tournament,
  type TournamentPredictionOption,
  type TournamentPredictionQuestion,
} from "@/lib/api";

type QuestionDraft = {
  id: number | null;
  code: string;
  title: string;
  description: string;
  option_type: "team" | "player" | "custom";
  status: "draft" | "active" | "locked" | "resolved" | "cancelled";
  points: string;
  lock_at: string;
};

type OptionDraft = {
  id: number | null;
  team_id: string;
  label: string;
  sort_order: string;
};

const defaultQuestionDraft: QuestionDraft = {
  id: null,
  code: "winner",
  title: "Победитель турнира",
  description: "",
  option_type: "team",
  status: "draft",
  points: "15",
  lock_at: "",
};

const defaultOptionDraft: OptionDraft = {
  id: null,
  team_id: "",
  label: "",
  sort_order: "1",
};

export function TournamentPredictionsAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<TournamentPredictionQuestion[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft>(defaultQuestionDraft);
  const [optionDrafts, setOptionDrafts] = useState<Record<number, OptionDraft>>({});
  const [message, setMessage] = useState<string | null>(null);

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => String(tournament.id) === selectedTournamentId) ?? null,
    [selectedTournamentId, tournaments],
  );

  async function loadBase() {
    const [tournamentRows, teamRows] = await Promise.all([
      apiGet<Tournament[]>("/admin/tournaments"),
      apiGet<Team[]>("/admin/teams"),
    ]);
    setTournaments(tournamentRows);
    setTeams(teamRows);
    if (!selectedTournamentId && tournamentRows[0]) {
      setSelectedTournamentId(String(tournamentRows[0].id));
    }
  }

  async function loadQuestions(tournamentId: string) {
    if (!tournamentId) {
      setQuestions([]);
      return;
    }

    const rows = await apiGet<TournamentPredictionQuestion[]>(`/admin/tournaments/${tournamentId}/prediction-questions`);
    setQuestions(rows);
    setOptionDrafts(
      Object.fromEntries(
        rows.map((question) => [
          question.id,
          {
            ...defaultOptionDraft,
            sort_order: String(question.options.length + 1),
          },
        ]),
      ),
    );
  }

  useEffect(() => {
    loadBase().catch(() => setMessage("Не удалось загрузить турниры и команды."));
  }, []);

  useEffect(() => {
    loadQuestions(selectedTournamentId).catch(() => setMessage("Не удалось загрузить турнирные прогнозы."));
  }, [selectedTournamentId]);

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedTournamentId) {
      setMessage("Сначала выберите турнир.");
      return;
    }

    setMessage(null);

    const payload = {
      code: questionDraft.code.trim(),
      title: questionDraft.title.trim(),
      description: questionDraft.description.trim() || null,
      option_type: questionDraft.option_type,
      status: questionDraft.status,
      points: Number(questionDraft.points),
      lock_at: questionDraft.lock_at ? new Date(questionDraft.lock_at).toISOString() : null,
    };

    try {
      if (questionDraft.id) {
        await apiPatch<TournamentPredictionQuestion>(`/admin/tournament-prediction-questions/${questionDraft.id}`, payload);
        setMessage("Турнирный вопрос обновлен.");
      } else {
        await apiPost<TournamentPredictionQuestion>(`/admin/tournaments/${selectedTournamentId}/prediction-questions`, payload);
        setMessage("Турнирный вопрос создан.");
      }

      setQuestionDraft(defaultQuestionDraft);
      await loadQuestions(selectedTournamentId);
    } catch {
      setMessage("Не удалось сохранить турнирный вопрос. Проверьте код, заголовок и баллы.");
    }
  }

  async function saveOption(question: TournamentPredictionQuestion) {
    const draft = optionDrafts[question.id] ?? defaultOptionDraft;
    const payload = {
      team_id: draft.team_id ? Number(draft.team_id) : null,
      label: draft.label.trim(),
      sort_order: Number(draft.sort_order),
    };

    try {
      if (draft.id) {
        await apiPatch<TournamentPredictionOption>(`/admin/tournament-prediction-options/${draft.id}`, payload);
        setMessage(`Вариант для "${question.title}" обновлен.`);
      } else {
        await apiPost<TournamentPredictionOption>(`/admin/tournament-prediction-questions/${question.id}/options`, payload);
        setMessage(`Вариант для "${question.title}" добавлен.`);
      }

      await loadQuestions(selectedTournamentId);
    } catch {
      setMessage("Не удалось сохранить вариант ответа. Проверьте название и порядок.");
    }
  }

  function startEditQuestion(question: TournamentPredictionQuestion) {
    setQuestionDraft({
      id: question.id,
      code: question.code,
      title: question.title,
      description: question.description ?? "",
      option_type: question.option_type,
      status: question.status,
      points: String(question.points),
      lock_at: question.lock_at ? question.lock_at.slice(0, 16) : "",
    });
  }

  function startEditOption(questionId: number, option: TournamentPredictionOption) {
    setOptionDrafts((current) => ({
      ...current,
      [questionId]: {
        id: option.id,
        team_id: option.team_id ? String(option.team_id) : "",
        label: option.label,
        sort_order: String(option.sort_order),
      },
    }));
  }

  function updateOptionDraft(questionId: number, patch: Partial<OptionDraft>) {
    setOptionDrafts((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] ?? defaultOptionDraft),
        ...patch,
      },
    }));
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <AdminField label="Турнир">
          <select className={inputClassName} value={selectedTournamentId} onChange={(event) => setSelectedTournamentId(event.target.value)}>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </AdminField>
        <p className="mt-2 text-sm text-muted">
          {selectedTournament
            ? `Настраиваем прогнозы на весь турнир для "${selectedTournament.name}".`
            : "Выберите турнир, чтобы управлять long-term вопросами."}
        </p>
      </section>

      <form onSubmit={saveQuestion} className="grid gap-4 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{questionDraft.id ? "Редактировать вопрос" : "Новый турнирный вопрос"}</h2>
          <AdminField label="Код">
            <input className={inputClassName} value={questionDraft.code} onChange={(event) => setQuestionDraft({ ...questionDraft, code: event.target.value })} />
          </AdminField>
          <AdminField label="Заголовок">
            <input className={inputClassName} value={questionDraft.title} onChange={(event) => setQuestionDraft({ ...questionDraft, title: event.target.value })} />
          </AdminField>
          <AdminField label="Описание">
            <textarea className={inputClassName} rows={3} value={questionDraft.description} onChange={(event) => setQuestionDraft({ ...questionDraft, description: event.target.value })} />
          </AdminField>
        </div>
        <div className="flex flex-col gap-3">
          <AdminField label="Тип вариантов">
            <select className={inputClassName} value={questionDraft.option_type} onChange={(event) => setQuestionDraft({ ...questionDraft, option_type: event.target.value as QuestionDraft["option_type"] })}>
              <option value="team">Команды</option>
              <option value="player">Игроки</option>
              <option value="custom">Свои варианты</option>
            </select>
          </AdminField>
          <AdminField label="Статус">
            <select className={inputClassName} value={questionDraft.status} onChange={(event) => setQuestionDraft({ ...questionDraft, status: event.target.value as QuestionDraft["status"] })}>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="locked">locked</option>
              <option value="resolved">resolved</option>
              <option value="cancelled">cancelled</option>
            </select>
          </AdminField>
          <AdminField label="Баллы">
            <input type="number" min={0} className={inputClassName} value={questionDraft.points} onChange={(event) => setQuestionDraft({ ...questionDraft, points: event.target.value })} />
          </AdminField>
          <AdminField label="Дедлайн">
            <input type="datetime-local" className={inputClassName} value={questionDraft.lock_at} onChange={(event) => setQuestionDraft({ ...questionDraft, lock_at: event.target.value })} />
          </AdminField>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
              {questionDraft.id ? "Сохранить вопрос" : "Создать вопрос"}
            </button>
            {questionDraft.id ? (
              <button type="button" className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium" onClick={() => setQuestionDraft(defaultQuestionDraft)}>
                Сбросить
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {message ? <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">{message}</div> : null}

      <section className="grid gap-4">
        {questions.length === 0 ? (
          <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Для этого турнира турнирные вопросы пока не созданы.</div>
        ) : (
          questions.map((question) => {
            const optionDraft = optionDrafts[question.id] ?? defaultOptionDraft;
            return (
              <article key={question.id} className="grid gap-4 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{question.title}</h3>
                    <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted">{question.code}</span>
                    <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted">{question.status}</span>
                    <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted">{question.points} pts</span>
                  </div>
                  {question.description ? <p className="text-sm text-muted">{question.description}</p> : null}
                  <div className="text-xs text-muted">
                    Тип: {question.option_type} {question.lock_at ? `· дедлайн ${new Date(question.lock_at).toLocaleString()}` : "· дедлайн не задан"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium" onClick={() => startEditQuestion(question)}>
                      Редактировать вопрос
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium">Варианты ответа</div>
                    {question.options.length === 0 ? (
                      <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">Варианты еще не добавлены.</div>
                    ) : (
                      question.options
                        .slice()
                        .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
                        .map((option) => (
                          <div key={option.id} className="flex items-center justify-between rounded-md border border-black/5 px-3 py-2 text-sm">
                            <div>
                              <span className="font-medium">{option.label}</span>
                              <span className="ml-2 text-xs text-muted">#{option.sort_order}</span>
                            </div>
                            <button type="button" className="text-xs text-muted underline-offset-2 hover:underline" onClick={() => startEditOption(question.id, option)}>
                              Изменить
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-md border border-black/5 bg-surface p-3">
                  <div className="text-sm font-medium">{optionDraft.id ? "Редактировать вариант" : "Добавить вариант"}</div>
                  {question.option_type === "team" ? (
                    <AdminField label="Команда">
                      <select
                        className={inputClassName}
                        value={optionDraft.team_id}
                        onChange={(event) => {
                          const selectedTeam = teams.find((team) => String(team.id) === event.target.value);
                          updateOptionDraft(question.id, {
                            team_id: event.target.value,
                            label: selectedTeam?.name ?? optionDraft.label,
                          });
                        }}
                      >
                        <option value="">Выберите команду</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {(team.flag_emoji ?? "")} {team.name}
                          </option>
                        ))}
                      </select>
                    </AdminField>
                  ) : null}
                  <AdminField label="Подпись варианта">
                    <input className={inputClassName} value={optionDraft.label} onChange={(event) => updateOptionDraft(question.id, { label: event.target.value })} />
                  </AdminField>
                  <AdminField label="Порядок">
                    <input type="number" min={0} className={inputClassName} value={optionDraft.sort_order} onChange={(event) => updateOptionDraft(question.id, { sort_order: event.target.value })} />
                  </AdminField>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white" onClick={() => saveOption(question)}>
                      {optionDraft.id ? "Сохранить вариант" : "Добавить вариант"}
                    </button>
                    {optionDraft.id ? (
                      <button type="button" className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium" onClick={() => updateOptionDraft(question.id, defaultOptionDraft)}>
                        Сбросить
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
