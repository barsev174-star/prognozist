"use client";

import { useEffect, useMemo, useState } from "react";

import { TeamLogo } from "@/components/TeamLogo";
import { AdminField, inputClassName } from "@/components/admin/AdminField";
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

const text = {
  loadMatchesError: "Не удалось загрузить матчи. Проверьте вход в админку.",
  loadPredictionError: "Не удалось загрузить экспертный прогноз для выбранного матча.",
  updated: "Прогноз эксперта обновлен.",
  created: "Прогноз эксперта создан.",
  saveError: "Не удалось сохранить прогноз. Проверьте счет, выбранный матч и статус публикации.",
  publishSuccess: "Прогноз опубликован в VIP-канал.",
  publishErrorFallback: "Не удалось опубликовать прогноз. Проверьте настройки VIP-канала.",
  title: "Прогноз эксперта",
  match: "Матч",
  score1: "Счет 1",
  score2: "Счет 2",
  publicAnswer1: "Ответ на публичный вопрос 1",
  publicAnswer2: "Ответ на публичный вопрос 2",
  vipAnswer: "Ответ на VIP-вопрос",
  saveButton: "Сохранить прогноз",
  createButton: "Создать прогноз",
  publishButton: "Опубликовать",
  loading: "Загрузка...",
  questionsTitle: "Вопросы выбранного матча",
  previewPublic1: "Публичный вопрос эксперта 1",
  previewPublic2: "Публичный вопрос эксперта 2",
  previewVip: "VIP-вопрос",
  summaryForecast: "Прогноз",
  summaryStatus: "Статус",
  summaryPublishedAt: "Публикация",
  statusPublished: "опубликован",
  statusDraft: "черновик",
  statusMissing: "нет",
  unpublished: "не создан",
  unpublishedDate: "нет",
  helper:
    "После публикации прогноз уходит в VIP-канал. После завершения матча итог и сравнение с прогнозом эксперта отправляются автоматически.",
  noQuestion: "Вопрос для выбранного матча не задан.",
  noValue: "Не указывать",
  yes: "Да",
  no: "Нет",
  notSet: "Не задан",
  pointsSuffix: "балл.",
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
      .catch(() => setMessage(text.loadMatchesError))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadMatchContext(matchId).catch(() => setMessage(text.loadPredictionError));
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
      setMessage(prediction ? text.updated : text.created);
    } catch {
      setMessage(text.saveError);
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
      setMessage(text.publishSuccess);
    } catch (error) {
      if (error instanceof Error && error.message.includes("409")) {
        setMessage("Не удалось опубликовать прогноз. VIP-канал не настроен или сейчас недоступен.");
      } else {
        setMessage(text.publishErrorFallback);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <form onSubmit={savePrediction} className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold">{text.title}</h2>
          <p className="mt-1 text-sm text-muted">{text.helper}</p>
        </div>

        <AdminField label={text.match}>
          <select className={inputClassName} value={matchId} onChange={(event) => setMatchId(event.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                #{match.id} · {match.team_1} - {match.team_2}
              </option>
            ))}
          </select>
        </AdminField>

        <div className="grid grid-cols-2 gap-2">
          <AdminField label={text.score1}>
            <input
              type="number"
              min={0}
              className={inputClassName}
              value={form.predicted_team_1_score}
              disabled={prediction?.is_published}
              onChange={(event) => setForm({ ...form, predicted_team_1_score: event.target.value })}
            />
          </AdminField>
          <AdminField label={text.score2}>
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
          label={text.publicAnswer1}
          questionText={firstPublicQuestion?.text}
          value={form.question_answer}
          disabled={prediction?.is_published}
          onChange={(value) => setForm({ ...form, question_answer: value })}
        />
        <QuestionAnswerSelect
          label={text.publicAnswer2}
          questionText={secondPublicQuestion?.text}
          value={form.question_2_answer}
          disabled={prediction?.is_published}
          onChange={(value) => setForm({ ...form, question_2_answer: value })}
        />
        <QuestionAnswerSelect
          label={text.vipAnswer}
          questionText={questions?.vip_question?.text}
          value={form.vip_question_answer}
          disabled={prediction?.is_published}
          onChange={(value) => setForm({ ...form, vip_question_answer: value })}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={isSaving || !matchId || prediction?.is_published} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {prediction ? text.saveButton : text.createButton}
          </button>
          <button
            type="button"
            disabled={isSaving || !prediction || prediction.is_published}
            onClick={publishPrediction}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {text.publishButton}
          </button>
        </div>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </form>

      <section className="rounded-lg bg-white shadow-sm">
        {isLoading ? <p className="p-4 text-sm text-muted">{text.loading}</p> : null}
        {selectedMatch ? <MatchSummary match={selectedMatch} prediction={prediction} /> : null}
        <div className="border-t border-black/5 p-4">
          <h3 className="text-sm font-semibold">{text.questionsTitle}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <QuestionPreview title={text.previewPublic1} question={firstPublicQuestion} />
            <QuestionPreview title={text.previewPublic2} question={secondPublicQuestion} />
            <QuestionPreview title={text.previewVip} question={questions?.vip_question ?? null} />
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
        <Metric label={text.summaryForecast} value={prediction ? `${prediction.predicted_team_1_score}:${prediction.predicted_team_2_score}` : text.unpublished} />
        <Metric label={text.summaryStatus} value={prediction?.is_published ? text.statusPublished : prediction ? text.statusDraft : text.statusMissing} />
        <Metric label={text.summaryPublishedAt} value={prediction?.published_at ? formatMatchDate(prediction.published_at) : text.unpublishedDate} />
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
        <div className="rounded-md bg-surface px-3 py-2 text-sm text-muted">{questionText ?? text.noQuestion}</div>
        <select className={inputClassName} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          <option value="unset">{text.noValue}</option>
          <option value="true">{text.yes}</option>
          <option value="false">{text.no}</option>
        </select>
      </div>
    </AdminField>
  );
}

function QuestionPreview({ title, question }: { title: string; question: Question | null }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <div className="text-xs font-medium text-muted">{title}</div>
      <div className="mt-1 text-sm">{question?.text ?? text.notSet}</div>
      {question ? <div className="mt-2 text-xs text-muted">{question.points} {text.pointsSuffix}</div> : null}
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
