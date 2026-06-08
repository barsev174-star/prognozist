import { AppHeader } from "@/components/AppHeader";

const title = "\u041f\u0440\u043e\u0444\u0438\u043b\u044c";
const heroEyebrow = "\u0410\u043a\u043a\u0430\u0443\u043d\u0442";
const heroTitle = "\u0412\u0430\u0448 \u0438\u0433\u0440\u043e\u0432\u043e\u0439 \u043f\u0430\u0441\u043f\u043e\u0440\u0442";
const heroBody = "\u0417\u0434\u0435\u0441\u044c \u043c\u044b \u0441\u043e\u0431\u0435\u0440\u0435\u043c \u0432\u0430\u0448 \u0441\u0442\u0430\u0442\u0443\u0441, \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u044f, VIP-\u0438\u0441\u0442\u043e\u0440\u0438\u044e \u0438 \u0440\u043e\u0441\u0442 \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435.";
const cardTitle = "\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0432 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0435";
const cardBody = "\u041f\u043e\u043a\u0430 \u044d\u0442\u043e\u0442 \u0440\u0430\u0437\u0434\u0435\u043b \u043f\u0443\u0441\u0442, \u043d\u043e \u043f\u043e\u0441\u043b\u0435 \u0440\u0435\u043b\u0438\u0437\u043d\u043e\u0433\u043e polish \u043e\u043d \u0441\u0442\u0430\u043d\u0435\u0442 \u0442\u043e\u0447\u043a\u043e\u0439 \u0432\u0445\u043e\u0434\u0430 \u0434\u043b\u044f \u043b\u0438\u0447\u043d\u043e\u0439 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0438.";

export default function ProfilePage() {
  return (
    <>
      <AppHeader title={title} />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5">
        <section className="rounded-[26px] border border-black/5 bg-[linear-gradient(135deg,rgba(23,32,51,0.12),rgba(15,118,110,0.12))] p-5 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{heroEyebrow}</div>
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
