"use client";

import { AppHeader } from "@/components/AppHeader";
import { AuthGate } from "@/components/AuthGate";
import type { UserProfile } from "@/lib/api";

export default function VipPage() {
  return (
    <>
      <AppHeader title="VIP" />
      <AuthGate>
        {(user) => (
          <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5">
            <VipStatus user={user} />

            <section className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold">Что дает VIP</h2>
              <div className="mt-3 flex flex-col gap-3 text-sm text-muted">
                <p>Доступ к VIP-вопросу в каждом матче.</p>
                <p>Дополнительные очки за правильные VIP-ответы.</p>
                <p>Если VIP-канал настроен, бот пришлет персональную ссылку сразу после оплаты.</p>
              </div>
            </section>

            <section className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold">Как подключить</h2>
              <p className="mt-2 text-sm text-muted">
                Вернитесь в чат с ботом и нажмите кнопку <span className="font-medium text-ink">VIP</span>. Оплата проходит
                через Telegram Stars.
              </p>
              <p className="mt-3 text-xs text-muted">
                После оплаты обновите приложение или откройте его заново из Telegram, чтобы увидеть новый статус.
              </p>
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
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Текущий статус</p>
          <h1 className="mt-1 text-xl font-semibold">{hasVip ? "VIP активен" : "VIP не подключен"}</h1>
        </div>
        <span
          className={
            hasVip
              ? "rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
              : "rounded-md bg-surface px-2 py-1 text-xs font-semibold text-muted"
          }
        >
          {hasVip ? "VIP" : "Free"}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">
        {hasVip && formattedDate
          ? `Доступ действует до ${formattedDate}.`
          : premiumUntil
            ? "Предыдущий VIP-доступ истек. Его можно подключить заново через бота."
            : "Сейчас доступны обычные прогнозы и публичные вопросы. VIP-вопросы видны, но отвечать на них можно только с активным VIP."}
      </p>
    </section>
  );
}
