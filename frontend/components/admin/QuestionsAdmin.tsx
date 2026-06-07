"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { apiGet, apiPatch, apiPost, type Match, type Question } from "@/lib/api";
import { getMatchStatusMeta } from "@/lib/matchStatus";

type MatchQuestions = {
  public_questions: Question[];
  public_question: Question | null;
  vip_question: Question | null;
};

type QuestionForm = {
  id: number | null;
  text: string;
  points: string;
};

const defaultPublicQuestions: Record<1 | 2, QuestionForm> = {
  1: { id: null, text: "Обе команды забьют?", points: "3" },
  2: { id: null, text: "Будет пенальти?", points: "3" },
};

const defaultVipQuestion: QuestionForm = {
  id: null,
  text: "Будет пенальти?",
  points: "3",
};

export function QuestionsAdmin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState("");
  const [publicQuestion1, setPublicQuestion1] = useState<QuestionForm>(defaultPublicQuestions[1]);
  const [publicQuestion2, setPublicQuestion2] = useState<QuestionForm>(defaultPublicQuestions[2]);
  const [vipQuestion, setVipQuestion] = useState<QuestionForm>(defaultVipQuestion);
  const [message, setMessage] = useState<string | null>(null);
  const selectedMatch = matches.find((item) => String(item.id) === matchId) ?? null;
  const selectedMatchStatus = selectedMatch ? getMatchStatusMeta(selectedMatch) : null;

  const selectedMatchTitle = useMemo(() => {
    const match = matches.find((item) => String(item.id) === matchId);
    return match ? `${match.team_1} - ${match.team_2}` : "Матч не выбран";
  }, [matches, matchId]);

  async function loadMatches() {
    const rows = await apiGet<Match[]>("/admin/matches");
    setMatches(rows);
    if (!matchId && rows[0]) {
      setMatchId(String(rows[0].id));
    }
  }

  async function loadQuestions(currentMatchId: string) {
    if (!currentMatchId) {
      return;
    }

    const questions = await apiGet<MatchQuestions>(`/admin/matches/${currentMatchId}/questions`);
    const bySlot = new Map(questions.public_questions.map((question) => [question.slot, question]));
    const firstQuestion = bySlot.get(1);
    const secondQuestion = bySlot.get(2);

    setPublicQuestion1({
      id: firstQuestion?.id ?? null,
      text: firstQuestion?.text ?? defaultPublicQuestions[1].text,
      points: String(firstQuestion?.points ?? defaultPublicQuestions[1].points),
    });
    setPublicQuestion2({
      id: secondQuestion?.id ?? null,
      text: secondQuestion?.text ?? defaultPublicQuestions[2].text,
      points: String(secondQuestion?.points ?? defaultPublicQuestions[2].points),
    });
    setVipQuestion({
      id: questions.vip_question?.id ?? null,
      text: questions.vip_question?.text ?? defaultVipQuestion.text,
      points: String(questions.vip_question?.points ?? defaultVipQuestion.points),
    });
  }

  useEffect(() => {
    loadMatches().catch(() => setMessage("Не удалось загрузить матчи. Проверьте вход в админку."));
  }, []);

  useEffect(() => {
    loadQuestions(matchId).catch(() => setMessage("Не удалось загрузить вопросы выбранного матча."));
  }, [matchId]);

  async function savePublicQuestion(slot: 1 | 2, form: QuestionForm) {
    const payload = {
      match_id: Number(matchId),
      slot,
      text: form.text,
      points: Number(form.points),
    };

    if (form.id) {
      await apiPatch<Question>(`/admin/questions/${form.id}`, payload);
    } else {
      await apiPost<Question>("/admin/questions", payload);
    }
  }

  async function saveVipQuestion(form: QuestionForm) {
    const payload = {
      match_id: Number(matchId),
      text: form.text,
      points: Number(form.points),
    };

    if (form.id) {
      await apiPatch<Question>(`/admin/vip-questions/${form.id}`, payload);
    } else {
      await apiPost<Question>("/admin/vip-questions", payload);
    }
  }

  async function saveAll(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    try {
      await savePublicQuestion(1, publicQuestion1);
      await savePublicQuestion(2, publicQuestion2);
      await saveVipQuestion(vipQuestion);
      await loadQuestions(matchId);
      setMessage("Вопросы сохранены.");
    } catch {
      setMessage("Не удалось сохранить вопросы. Проверьте, что выбран матч, тексты заполнены, а баллы указаны числами.");
    }
  }

  return (
    <form onSubmit={saveAll} className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <AdminField label="Матч">
          <select className={inputClassName} value={matchId} onChange={(event) => setMatchId(event.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {formatAdminMatchOptionWithStatus(match)}
              </option>
            ))}
          </select>
        </AdminField>
        <p className="mt-2 text-sm text-muted">Вопросы для матча: {selectedMatchTitle}</p>
        {selectedMatch && selectedMatchStatus ? (
          <div
            className={
              selectedMatch.status === "completed"
                ? "mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900"
                : "mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            }
          >
            <div className="flex items-center gap-2 font-medium">
              <span className={`h-2 w-2 rounded-full ${selectedMatchStatus.dotClassName}`} />
              {selectedMatchStatus.label}
            </div>
            <div className="mt-1">
              {selectedMatch.status === "completed"
                ? "Матч уже завершен. Вопросы можно просматривать, но ориентируйтесь на итоговый статус матча."
                : `Статус вопросов: ${formatQuestionReadiness(selectedMatch)}.`}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuestionCard title="Публичный вопрос 1" form={publicQuestion1} onChange={setPublicQuestion1} />
        <QuestionCard title="Публичный вопрос 2" form={publicQuestion2} onChange={setPublicQuestion2} />
        <QuestionCard title="VIP-вопрос" form={vipQuestion} onChange={setVipQuestion} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Сохранить вопросы</button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </div>
    </form>
  );
}

function formatQuestionReadiness(match: Match): string {
  const publicCount = match.public_questions_count ?? 0;
  const vipReady = Boolean(match.vip_question_exists);
  return publicCount >= 2 && vipReady ? "вопросы OK" : `вопросы ${publicCount}/2${vipReady ? " + VIP" : ""}`;
}

function formatAdminMatchOptionWithStatus(match: Match): string {
  const status = getMatchStatusMeta(match);
  return `${status.label} · ${formatQuestionReadiness(match)} · ${match.team_1} - ${match.team_2}`;
}

function QuestionCard({
  title,
  form,
  onChange,
}: {
  title: string;
  form: QuestionForm;
  onChange: (form: QuestionForm) => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <AdminField label="Текст вопроса">
        <textarea
          className={inputClassName}
          rows={4}
          value={form.text}
          onChange={(event) => onChange({ ...form, text: event.target.value })}
        />
      </AdminField>
      <AdminField label="Баллы">
        <input
          type="number"
          min={1}
          className={inputClassName}
          value={form.points}
          onChange={(event) => onChange({ ...form, points: event.target.value })}
        />
      </AdminField>
      {form.id ? <p className="text-xs text-muted">Существующий вопрос #{form.id}</p> : <p className="text-xs text-muted">Новый вопрос</p>}
    </section>
  );
}
