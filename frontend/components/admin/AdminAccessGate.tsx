"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet, hasAccessToken, type UserProfile } from "@/lib/api";

type AdminAccessState =
  | { status: "loading" }
  | { status: "allowed"; user: UserProfile }
  | { status: "missing_token" }
  | { status: "forbidden" };

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AdminAccessState>({ status: "loading" });

  useEffect(() => {
    if (!hasAccessToken()) {
      setState({ status: "missing_token" });
      return;
    }

    apiGet<UserProfile>("/admin/me")
      .then((user) => setState({ status: "allowed", user }))
      .catch(() => setState({ status: "forbidden" }));
  }, []);

  if (state.status === "loading") {
    return <div className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">Проверяем доступ...</div>;
  }

  if (state.status === "missing_token") {
    return (
      <div className="rounded-lg bg-white p-4 text-sm shadow-sm">
        <p className="font-medium">Нужен вход в админку</p>
        <p className="mt-1 text-muted">В production входите через Telegram в браузере. Для локального теста можно использовать dev-login.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-md bg-ink px-4 py-2 font-medium text-white" href="/admin/login">
            Войти через Telegram
          </Link>
          <Link className="rounded-md border border-black/10 bg-white px-4 py-2 font-medium" href="/dev-login">
            Локальный вход
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "forbidden") {
    return (
      <div className="rounded-lg bg-white p-4 text-sm shadow-sm">
        <p className="font-medium">Нет доступа к админке</p>
        <p className="mt-1 text-muted">
          Вы вошли как обычный игрок. Для админки используйте Telegram ID администратора, а для теста прогнозов откройте приложение игрока.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-md bg-ink px-4 py-2 font-medium text-white" href="/">
            Приложение
          </Link>
          <Link className="rounded-md border border-black/10 bg-white px-4 py-2 font-medium" href="/dev-login">
            Сменить пользователя
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
