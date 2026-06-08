import { AppHeader } from "@/components/AppHeader";

const title = "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044b";
const eyebrow = "\u0420\u043e\u0441\u0442 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0430";
const heroTitle = "\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0430\u0439\u0442\u0435 \u0434\u0440\u0443\u0437\u0435\u0439 \u0432 Prognozist";
const heroBody = "\u0421\u043a\u043e\u0440\u043e \u0437\u0434\u0435\u0441\u044c \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0432\u0430\u0448\u0430 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0441\u044b\u043b\u043a\u0430, \u0447\u0442\u043e\u0431\u044b \u0440\u0430\u0441\u0442\u0438\u0442\u044c \u0441\u0432\u043e\u044e \u043b\u0438\u0433\u0443 \u0438 \u0432\u043e\u0432\u043b\u0435\u043a\u0430\u0442\u044c \u043d\u043e\u0432\u044b\u0445 \u0438\u0433\u0440\u043e\u043a\u043e\u0432.";
const cardTitle = "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0441\u044b\u043b\u043a\u0430";
const cardBody = "\u041a\u043e\u0433\u0434\u0430 \u043c\u044b \u0434\u043e\u0431\u044c\u0435\u043c \u0440\u0435\u0444\u0435\u0440\u0430\u043b\u044c\u043d\u044b\u0439 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439, \u0432 \u044d\u0442\u043e\u043c \u0431\u043b\u043e\u043a\u0435 \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0433\u043e\u0442\u043e\u0432\u0430\u044f \u0441\u0441\u044b\u043b\u043a\u0430 \u0434\u043b\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u0434\u0440\u0443\u0437\u044c\u044f\u043c.";

export default function ReferralsPage() {
  return (
    <>
      <AppHeader title={title} />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5">
        <section className="rounded-[26px] border border-black/5 bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(34,197,94,0.12))] p-5 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
          <h2 className="mt-2 text-xl font-semibold">{heroTitle}</h2>
          <p className="mt-2 text-sm text-muted">{heroBody}</p>
        </section>

        <section className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
          <h3 className="text-sm font-semibold">{cardTitle}</h3>
          <p className="mt-2 text-sm text-muted">{cardBody}</p>
        </section>
      </main>
    </>
  );
}
