"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { authenticateTelegram, type UserProfile } from "@/lib/api";
import { getTelegramInitData } from "@/lib/telegram";

type AuthGateProps = {
  children: (user: UserProfile) => ReactNode;
};

type AuthState =
  | { status: "loading" }
  | { status: "ready"; user: UserProfile }
  | { status: "outside_telegram" }
  | { status: "error"; message: string };

export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const initData = getTelegramInitData();
    window.Telegram?.WebApp?.ready?.();

    if (!initData) {
      setState({ status: "outside_telegram" });
      return;
    }

    authenticateTelegram(initData)
      .then((response) => {
        sessionStorage.setItem("access_token", response.access_token);
        setState({ status: "ready", user: response.user });
      })
      .catch(() => {
        setState({ status: "error", message: "Не удалось войти через Telegram." });
      });
  }, []);

  if (state.status === "loading") {
    return <StatusCard text="Загрузка..." />;
  }

  if (state.status === "outside_telegram") {
    return <StatusCard text="Откройте приложение внутри Telegram." />;
  }

  if (state.status === "error") {
    return <StatusCard text={state.message} />;
  }

  return <>{children(state.user)}</>;
}

function StatusCard({ text }: { text: string }) {
  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto max-w-md rounded-lg bg-white p-4 text-sm text-muted shadow-sm">{text}</div>
    </main>
  );
}
