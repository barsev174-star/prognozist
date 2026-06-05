"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { authenticateTelegram, getCurrentUser, type UserProfile } from "@/lib/api";
import { waitForTelegramInitData } from "@/lib/telegram";

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
    let isMounted = true;

    async function authenticate() {
      if (sessionStorage.getItem("access_token")) {
        try {
          const user = await getCurrentUser();
          if (!isMounted) {
            return;
          }
          setState({ status: "ready", user });
          return;
        } catch {
          sessionStorage.removeItem("access_token");
        }
      }

      const initData = await waitForTelegramInitData();
      window.Telegram?.WebApp?.ready?.();

      if (!isMounted) {
        return;
      }

      if (!initData) {
        setState({ status: "outside_telegram" });
        return;
      }

      authenticateTelegram(initData)
        .then((response) => {
          if (!isMounted) {
            return;
          }
          sessionStorage.setItem("access_token", response.access_token);
          setState({ status: "ready", user: response.user });
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }
          setState({ status: "error", message: "Не удалось войти через Telegram." });
        });
    }

    authenticate();

    return () => {
      isMounted = false;
    };
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
