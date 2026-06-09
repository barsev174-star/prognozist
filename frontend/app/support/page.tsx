"use client";

import { useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { AuthGate } from "@/components/AuthGate";
import { apiPost, type SupportRequestPayload, type SupportRequestResponse } from "@/lib/api";

const title = "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430";
const eyebrow = "\u041e\u0431\u0440\u0430\u0442\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u044c";
const heroTitle = "\u0420\u0430\u0441\u0441\u043a\u0430\u0436\u0438\u0442\u0435, \u0447\u0442\u043e \u043f\u043e\u0448\u043b\u043e \u043d\u0435 \u0442\u0430\u043a";
const heroBody =
  "\u0417\u0434\u0435\u0441\u044c \u043c\u043e\u0436\u043d\u043e \u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0431\u0430\u0433, \u0438\u0434\u0435\u044e \u0438\u043b\u0438 \u0432\u043e\u043f\u0440\u043e\u0441. \u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043f\u0440\u0438\u0434\u0435\u0442 \u0432 \u0430\u0434\u043c\u0438\u043d\u043a\u0443.";
const submitLabel = "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c";
const successText = "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e. \u0421\u043f\u0430\u0441\u0438\u0431\u043e.";
const errorText = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435.";

export default function SupportPage() {
  return (
    <>
      <AppHeader title={title} />
      <AuthGate>{() => <SupportContent />}</AuthGate>
    </>
  );
}

function SupportContent() {
  const [category, setCategory] = useState<SupportRequestPayload["category"]>("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      await apiPost<SupportRequestResponse>("/support/requests", {
        category,
        message,
      });
      setMessage("");
      setCategory("bug");
      setStatus(successText);
    } catch {
      setStatus(errorText);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5">
      <section className="rounded-[26px] border border-black/5 bg-[linear-gradient(135deg,rgba(23,32,51,0.12),rgba(239,68,68,0.1))] p-5 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
        <h2 className="mt-2 text-xl font-semibold">{heroTitle}</h2>
        <p className="mt-2 text-sm text-muted">{heroBody}</p>
      </section>

      <form onSubmit={submitForm} className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
        <label className="block text-sm font-medium text-ink">
          \u0422\u0438\u043f \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u044f
          <select
            className="mt-2 w-full rounded-[16px] border border-black/10 bg-white px-3 py-3 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value as SupportRequestPayload["category"])}
          >
            <option value="bug">\u0411\u0430\u0433</option>
            <option value="idea">\u0418\u0434\u0435\u044f</option>
            <option value="question">\u0412\u043e\u043f\u0440\u043e\u0441</option>
            <option value="payment">\u041e\u043f\u043b\u0430\u0442\u0430</option>
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          \u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435
          <textarea
            className="mt-2 min-h-36 w-full rounded-[16px] border border-black/10 bg-white px-3 py-3 text-sm"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="\u041e\u043f\u0438\u0448\u0438\u0442\u0435 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044e \u0438\u043b\u0438 \u0438\u0434\u0435\u044e"
          />
        </label>

        <button
          className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
          disabled={isSaving || message.trim().length < 10}
          type="submit"
        >
          {isSaving ? "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c..." : submitLabel}
        </button>

        {status ? <p className="mt-3 text-sm text-muted">{status}</p> : null}
      </form>
    </main>
  );
}
