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
  1: { id: null, text: "РћР±Рµ РєРѕРјР°РЅРґС‹ Р·Р°Р±СЊСЋС‚?", points: "3" },
  2: { id: null, text: "Р‘СѓРґРµС‚ РїРµРЅР°Р»СЊС‚Рё?", points: "3" },
};

const defaultVipQuestion: QuestionForm = {
  id: null,
  text: "Р‘СѓРґРµС‚ РїРµРЅР°Р»СЊС‚Рё?",
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
    return match ? `${match.team_1} - ${match.team_2}` : "РњР°С‚С‡ РЅРµ РІС‹Р±СЂР°РЅ";
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
    loadMatches().catch(() => setMessage("РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РјР°С‚С‡Рё. РџСЂРѕРІРµСЂСЊС‚Рµ РІС…РѕРґ РІ Р°РґРјРёРЅРєСѓ."));
  }, []);

  useEffect(() => {
    loadQuestions(matchId).catch(() => setMessage("РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РІРѕРїСЂРѕСЃС‹ РІС‹Р±СЂР°РЅРЅРѕРіРѕ РјР°С‚С‡Р°."));
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
      setMessage("Р’РѕРїСЂРѕСЃС‹ СЃРѕС…СЂР°РЅРµРЅС‹.");
    } catch {
      setMessage("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РІРѕРїСЂРѕСЃС‹. РџСЂРѕРІРµСЂСЊС‚Рµ, С‡С‚Рѕ РІС‹Р±СЂР°РЅ РјР°С‚С‡, С‚РµРєСЃС‚С‹ Р·Р°РїРѕР»РЅРµРЅС‹, Р° Р±Р°Р»Р»С‹ СѓРєР°Р·Р°РЅС‹ С‡РёСЃР»Р°РјРё.");
    }
  }

  return (
    <form onSubmit={saveAll} className="flex flex-col gap-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <AdminField label="РњР°С‚С‡">
          <select className={inputClassName} value={matchId} onChange={(event) => setMatchId(event.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {formatAdminMatchOptionWithStatus(match)}
              </option>
            ))}
          </select>
        </AdminField>
        <p className="mt-2 text-sm text-muted">Р’РѕРїСЂРѕСЃС‹ РґР»СЏ РјР°С‚С‡Р°: {selectedMatchTitle}</p>
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
                ? "Р СљР В°РЎвЂљРЎвЂЎ РЎС“Р В¶Р Вµ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р ВµР Р…. Р вЂ™Р С•Р С—РЎР‚Р С•РЎРѓРЎвЂ№ Р СР С•Р В¶Р Р…Р С• Р С—РЎР‚Р С•РЎРѓР СР В°РЎвЂљРЎР‚Р С‘Р Р†Р В°РЎвЂљРЎРЉ, Р Р…Р С• Р С•РЎР‚Р С‘Р ВµР Р…РЎвЂљР С‘РЎР‚РЎС“Р в„–РЎвЂљР ВµРЎРѓРЎРЉ Р Р…Р В° Р С‘РЎвЂљР С•Р С–Р С•Р Р†РЎвЂ№Р в„– РЎРѓРЎвЂљР В°РЎвЂљРЎС“РЎРѓ Р СР В°РЎвЂљРЎвЂЎР В°."
                : `Р РЋРЎвЂљР В°РЎвЂљРЎС“РЎРѓ Р Р†Р С•Р С—РЎР‚Р С•РЎРѓР С•Р Р†: ${formatQuestionReadiness(selectedMatch)}.`}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuestionCard
          title="РџСѓР±Р»РёС‡РЅС‹Р№ РІРѕРїСЂРѕСЃ 1"
          form={publicQuestion1}
          onChange={setPublicQuestion1}
        />
        <QuestionCard
          title="РџСѓР±Р»РёС‡РЅС‹Р№ РІРѕРїСЂРѕСЃ 2"
          form={publicQuestion2}
          onChange={setPublicQuestion2}
        />
        <QuestionCard
          title="VIP-РІРѕРїСЂРѕСЃ"
          form={vipQuestion}
          onChange={setVipQuestion}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">РЎРѕС…СЂР°РЅРёС‚СЊ РІРѕРїСЂРѕСЃС‹</button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </div>
    </form>
  );
}

function formatQuestionReadiness(match: Match): string {
  const publicCount = match.public_questions_count ?? 0;
  const vipReady = Boolean(match.vip_question_exists);
  return publicCount >= 2 && vipReady ? "Р Р†Р С•Р С—РЎР‚Р С•РЎРѓРЎвЂ№ OK" : `Р Р†Р С•Р С—РЎР‚Р С•РЎРѓРЎвЂ№ ${publicCount}/2${vipReady ? " + VIP" : ""}`;
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
      <AdminField label="РўРµРєСЃС‚ РІРѕРїСЂРѕСЃР°">
        <textarea
          className={inputClassName}
          rows={4}
          value={form.text}
          onChange={(event) => onChange({ ...form, text: event.target.value })}
        />
      </AdminField>
      <AdminField label="Р‘Р°Р»Р»С‹">
        <input
          type="number"
          min={1}
          className={inputClassName}
          value={form.points}
          onChange={(event) => onChange({ ...form, points: event.target.value })}
        />
      </AdminField>
      {form.id ? <p className="text-xs text-muted">РЎСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ РІРѕРїСЂРѕСЃ #{form.id}</p> : <p className="text-xs text-muted">РќРѕРІС‹Р№ РІРѕРїСЂРѕСЃ</p>}
    </section>
  );
}
