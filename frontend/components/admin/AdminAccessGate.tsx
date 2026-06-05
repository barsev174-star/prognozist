"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalAuthNotice } from "@/components/LocalAuthNotice";
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
    return <LocalAuthNotice />;
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
