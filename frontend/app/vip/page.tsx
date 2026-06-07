"use client";

import { AppHeader } from "@/components/AppHeader";
import { AuthGate } from "@/components/AuthGate";
import type { UserProfile } from "@/lib/api";

const benefitsTitle = "\u0427\u0442\u043e \u0434\u0430\u0435\u0442 VIP";
const benefitOne = "\u0414\u043e\u0441\u0442\u0443\u043f \u043a VIP-\u0432\u043e\u043f\u0440\u043e\u0441\u0443 \u0432 \u043a\u0430\u0436\u0434\u043e\u043c \u043c\u0430\u0442\u0447\u0435.";
const benefitTwo = "\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043e\u0447\u043a\u0438 \u0437\u0430 \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0435 VIP-\u043e\u0442\u0432\u0435\u0442\u044b.";
const benefitThree = "\u0415\u0441\u043b\u0438 VIP-\u043a\u0430\u043d\u0430\u043b \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d, \u0431\u043e\u0442 \u043f\u0440\u0438\u0448\u043b\u0435\u0442 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0443\u044e \u0441\u0441\u044b\u043b\u043a\u0443 \u0441\u0440\u0430\u0437\u0443 \u043f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b.";
const connectTitle = "\u041a\u0430\u043a \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c";
const connectBody = "\u0412\u0435\u0440\u043d\u0438\u0442\u0435\u0441\u044c \u0432 \u0447\u0430\u0442 \u0441 \u0431\u043e\u0442\u043e\u043c \u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443 ";
const vipButtonLabel = "VIP";
const connectTail = ". \u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442 \u0447\u0435\u0440\u0435\u0437 Telegram Stars.";
const refreshNote = "\u041f\u043e\u0441\u043b\u0435 \u043e\u043f\u043b\u0430\u0442\u044b \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0438\u043b\u0438 \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0435\u0433\u043e \u0437\u0430\u043d\u043e\u0432\u043e \u0438\u0437 Telegram, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u043d\u043e\u0432\u044b\u0439 \u0441\u0442\u0430\u0442\u0443\u0441.";
const currentStatus = "\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441";
const vipOn = "VIP \u0430\u043a\u0442\u0438\u0432\u0435\u043d";
const vipOff = "VIP \u043d\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d";
const expiredText = "\u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u0439 VIP-\u0434\u043e\u0441\u0442\u0443\u043f \u0438\u0441\u0442\u0435\u043a. \u0415\u0433\u043e \u043c\u043e\u0436\u043d\u043e \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e \u0447\u0435\u0440\u0435\u0437 \u0431\u043e\u0442\u0430.";
const upsellText =
  "\u0421\u0435\u0439\u0447\u0430\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u043e\u0431\u044b\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u044b \u0438 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b. VIP-\u0432\u043e\u043f\u0440\u043e\u0441\u044b \u0432\u0438\u0434\u043d\u044b, \u043d\u043e \u043e\u0442\u0432\u0435\u0447\u0430\u0442\u044c \u043d\u0430 \u043d\u0438\u0445 \u043c\u043e\u0436\u043d\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u0441 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u043c VIP.";

export default function VipPage() {
  return (
    <>
      <AppHeader title="VIP" />
      <AuthGate>
        {(user) => (
          <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5">
            <VipStatus user={user} />

            <section className="rounded-[24px] border border-[rgba(245,158,11,0.18)] bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(255,255,255,0.88))] p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
              <h2 className="text-base font-semibold">{benefitsTitle}</h2>
              <div className="mt-3 flex flex-col gap-3 text-sm text-muted">
                <p>{benefitOne}</p>
                <p>{benefitTwo}</p>
                <p>{benefitThree}</p>
              </div>
            </section>

            <section className="rounded-[24px] border border-black/5 bg-white/92 p-4 shadow-[0_10px_30px_rgba(23,32,51,0.08)]">
              <h2 className="text-base font-semibold">{connectTitle}</h2>
              <p className="mt-2 text-sm text-muted">
                {connectBody}
                <span className="font-medium text-ink">{vipButtonLabel}</span>
                {connectTail}
              </p>
              <p className="mt-3 text-xs text-muted">{refreshNote}</p>
            </section>
          </main>
        )}
      </AuthGate>
    </>
  );
}

function VipStatus({ user }: { user: UserProfile }) {
  const premiumUntil = user.premium_until ? new Date(user.premium_until) : null;
  const hasVip = premiumUntil !== null && premiumUntil.getTime() > Date.now();
  const formattedDate = premiumUntil
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(premiumUntil)
    : null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#172033_0%,#5b3a00_100%)] p-5 text-white shadow-[0_18px_55px_rgba(23,32,51,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">{currentStatus}</p>
          <h1 className="mt-2 text-2xl font-semibold">{hasVip ? vipOn : vipOff}</h1>
        </div>
        <span
          className={
            hasVip
              ? "rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              : "rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/78"
          }
        >
          {hasVip ? "VIP" : "Free"}
        </span>
      </div>

      <p className="mt-4 text-sm text-white/78">
        {hasVip && formattedDate ? `\u0414\u043e\u0441\u0442\u0443\u043f \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043e ${formattedDate}.` : premiumUntil ? expiredText : upsellText}
      </p>
    </section>
  );
}
