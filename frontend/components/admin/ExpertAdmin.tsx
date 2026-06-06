"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField, inputClassName } from "@/components/admin/AdminField";
import { TeamLogo } from "@/components/TeamLogo";
import { apiGet, apiPatch, apiPost, type Match, type Question } from "@/lib/api";
import { formatMatchDate, getMatchStatusMeta } from "@/lib/matchStatus";

type MatchQuestions = {
  public_questions: Question[];
  public_question: Question | null;
  vip_question: Question | null;
};

type ExpertPrediction = {
  id: number;
  match_id: number;
  expert_user_id: number | null;
  predicted_team_1_score: number;
  predicted_team_2_score: number;
  question_answer: boolean | null;
  question_2_answer: boolean | null;
  vip_question_answer: boolean | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ExpertForm = {
  predicted_team_1_score: string;
  predicted_team_2_score: string;
  question_answer: string;
  question_2_answer: string;
  vip_question_answer: string;
};

const emptyForm: ExpertForm = {
  predicted_team_1_score: "1",
  predicted_team_2_score: "0",
  question_answer: "unset",
  question_2_answer: "unset",
  vip_question_answer: "unset",
};

export function ExpertAdmin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState("");
  const [questions, setQuestions] = useState<MatchQuestions | null>(null);
  const [prediction, setPrediction] = useState<ExpertPrediction | null>(null);
  const [form, setForm] = useState<ExpertForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedMatch = useMemo(() => matches.find((match) => String(match.id) === matchId) ?? null, [matches, matchId]);
  const publicQuestions = questions?.public_questions.length
    ? questions.public_questions
    : questions?.public_question
      ? [questions.public_question]
      : [];
  const firstPublicQuestion = publicQuestions[0] ?? null;
  const secondPublicQuestion = publicQuestions[1] ?? null;

  async function loadMatches() {
    const rows = await apiGet<Match[]>("/admin/matches");
    setMatches(rows);
    if (!matchId && rows[0]) {
      setMatchId(String(rows[0].id));
    }
  }

  async function loadMatchContext(currentMatchId: string) {
    if (!currentMatchId) {
      setQuestions(null);
      setPrediction(null);
      setForm(emptyForm);
      return;
    }

    const questionRows = await apiGet<MatchQuestions>(`/admin/matches/${currentMatchId}/questions`);
    setQuestions(questionRows);

    try {
      const expert = await apiGet<ExpertPrediction>(`/admin/expert-predictions/${currentMatchId}`);
      setPrediction(expert);
      setForm({
        predicted_team_1_score: String(expert.predicted_team_1_score),
        predicted_team_2_score: String(expert.predicted_team_2_score),
        question_answer: boolToSelectValue(expert.question_answer),
        question_2_answer: boolToSelectValue(expert.question_2_answer),
        vip_question_answer: boolToSelectValue(expert.vip_question_answer),
      });
    } catch {
      setPrediction(null);
      setForm(emptyForm);
    }
  }

  useEffect(() => {
    loadMatches()
      .catch(() => setMessage("Не удалось загрузить матчи. Проверьте вход в админку."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadMatchContext(matchId).catch(() => setMessage("Не удалось загрузить экспертный прогноз для выбранного матча."));
  }, [matchId]);

  async function savePrediction(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);

    const payload = {
      match_id: Number(matchId),
      predicted_team_1_score: Number(form.predicted_team_1_score),
      predicted_team_2_score: Number(form.predicted_team_2_score),
      question_answer: selectValueToBool(form.question_answer),
      question_2_answer: selectValueToBool(form.question_2_answer),
      vip_question_answer: selectValueToBool(form.vip_question_answer),
    };

    try {
      const saved = prediction
        ? await apiPatch<ExpertPrediction>(`/admin/expert-predictions/${prediction.id}`, payload)
        : await apiPost<ExpertPrediction>("/admin/expert-predictions", payload);
      setPrediction(saved);
      setMessage(prediction ? "Прогноз эксперта обновлен." : "Прогноз эксперта создан.");
    } catch {
      setMessage("Не удалось сохранить прогноз. Проверьте счет, выбранный матч и статус публикации.");
    } finally {
      setIsSaving(false);
    }
  }

  async function publishPrediction() {
    if (!prediction) {
      return;
    }

    setMessage(null);
    setIsSaving(true);
    try {
      const published = await apiPost<ExpertPrediction>(`/admin/expert-predictions/${prediction.id}/publish`);
      setPrediction(published);
      setMessage("Прогноз опубликован в VIP-канал, если канал настроен.");
    } catch {
      setMessage("Не удалось опубликовать прогноз. Проверьте настройки VIP-канала и статус прогноза.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <form onSubmit={savePrediction} className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Прогноз эксперта</h2>
        <AdminField label="Матч">
          <select className={inputClassName} value={matchId} onChange={(event) => setMatchId(event.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                #{match.id} · {match.team_1} - {match.team_2}
              </option>
            ))}
          </select>
        </AdminField>

        <div className="grid grid-cols-2 gap-2">
          <AdminField label="Счет 1">
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={form.predicted_team_1_score}
              disabled={prediction?.is_published}
              onChange={(event) => setForm({ ...form, predicted_team_1_score: event.target.value })}
            />
          </AdminField>
          <AdminField label="Счет 2">
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={form.predicted_team_2_score}
              disabled={prediction?.is_published}
              onChange={(event) => setForm({ ...form, predicted_team_2_score: event.target.value })}
            />
          </AdminField>
        </div>

        <QuestionAnswerSelect
          label="Ответ на публичный вопрос 1"
          questionText={firstPublicQuestion?.text}
          value={form.question_answer}
          disabled={prediction?.is_published}
          onChange={(value) => setForm({ ...form, question_answer: value })}
        />
        <QuestionAnswerSelect
          label="Ответ на публичный вопрос 2"
          questionText={secondPublicQuestion?.text}
          value={form.question_2_answer}
          disabled={prediction?.is_published}
          onChange={(value) => setForm({ ...form, question_2_answer: value })}
        />
        <QuestionAnswerSelect
          label="Ответ на VIP-вопрос"
          questionText={questions?.vip_question?.text}
          value={form.vip_question_answer}
          disabled={prediction?.is_published}
          onChange={(value) => setForm({ ...form, vip_question_answer: value })}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={isSaving || !matchId || prediction?.is_published} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {prediction ? "Сохранить прогноз" : "Создать прогноз"}
          </button>
          <button
            type="button"
            disabled={isSaving || !prediction || prediction.is_published}
            onClick={publishPrediction}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-50"
          >
            Опубликовать
          </button>
        </div>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </form>

      <section className="rounded-lg bg-white shadow-sm">
        {isLoading ? <p className="p-4 text-sm text-muted">Загрузка...</p> : null}
        {selectedMatch ? <MatchSummary match={selectedMatch} prediction={prediction} /> : null}
        <div className="border-t border-black/5 p-4">
          <h3 className="text-sm font-semibold">Вопросы выбранного матча</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <QuestionPreview title="Публичный вопрос эксперта 1" question={firstPublicQuestion} />
            <QuestionPreview title="Публичный вопрос эксперта 2" question={secondPublicQuestion} />
            <QuestionPreview title="VIP-вопрос" question={questions?.vip_question ?? null} />
          </div>
        </div>
      </section>
    </div>
  );
}

function MatchSummary({ match, prediction }: { match: Match; prediction: ExpertPrediction | null }) {
  const status = getMatchStatusMeta(match);

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <TeamLogo logo={match.team_1_logo} name={match.team_1} size="sm" />
        <h2 className="text-lg font-semibold">
          {match.team_1} - {match.team_2}
        </h2>
        <TeamLogo logo={match.team_2_logo} name={match.team_2} size="sm" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span>#{match.id}</span>
        <span>{formatMatchDate(match.start_time)}</span>
        <span className={`inline-flex items-center gap-1 ${status.textClassName}`}>
          <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
          {status.label}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Прогноз" value={prediction ? `${prediction.predicted_team_1_score}:${prediction.predicted_team_2_score}` : "не создан"} />
        <Metric label="Статус" value={prediction?.is_published ? "опубликован" : prediction ? "черновик" : "нет"} />
        <Metric label="Публикация" value={prediction?.published_at ? formatMatchDate(prediction.published_at) : "нет"} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function QuestionAnswerSelect({
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
        <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">{questionText ?? "Вопрос для выбранного матча не задан."}</div>
        <select className={inputClassName} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          <option value="unset">Не указывать</option>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </div>
    </AdminField>
  );
}

function QuestionPreview({ title, question }: { title: string; question: Question | null }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <div className="text-xs font-medium text-muted">{title}</div>
      <div className="mt-1 text-sm">{question?.text ?? "Не задан"}</div>
      {question ? <div className="mt-2 text-xs text-muted">{question.points} балл.</div> : null}
    </div>
  );
}

function boolToSelectValue(value: boolean | null): string {
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  return "unset";
}

function selectValueToBool(value: string): boolean | null {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}
