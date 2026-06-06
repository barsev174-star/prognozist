"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet, authenticateTelegramBrowserAdmin, hasAccessToken, type TelegramBrowserAuthPayload, type UserProfile } from "@/lib/api";

declare global {
  interface Window {
    onTelegramAdminAuth?: (user: TelegramBrowserAuthPayload) => void;
  }
}

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

export default function AdminLoginPage() {
  const router = useRouter();
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasAccessToken()) {
      apiGet<UserProfile>("/admin/me")
        .then(() => router.replace("/admin"))
        .catch(() => {
          sessionStorage.removeItem("access_token");
          setStatus("ready");
        });
      return;
    }

    setStatus("ready");
  }, [router]);

  useEffect(() => {
    if (!botUsername || status !== "ready" || !widgetRef.current) {
      return;
    }

    const container = widgetRef.current;
    container.innerHTML = "";

    window.onTelegramAdminAuth = async (user) => {
      setStatus("loading");
      setMessage(null);

      try {
        const response = await authenticateTelegramBrowserAdmin(user);
        sessionStorage.setItem("access_token", response.access_token);
        router.replace("/admin");
      } catch {
        setStatus("ready");
        setMessage("Не удалось войти в админку. Проверьте, что ваш Telegram ID добавлен в список администраторов.");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAdminAuth(user)");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
      delete window.onTelegramAdminAuth;
    };
  }, [router, status]);

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col gap-4 rounded-lg bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Вход в админку</h1>
        <p className="text-sm text-muted">
          Откройте вход через Telegram в обычном браузере. После проверки вы попадете в ту же админку проекта.
        </p>

        {!botUsername ? (
          <div className="rounded-md bg-surface px-3 py-3 text-sm text-muted">
            Не задан `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` в окружении фронтенда.
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div ref={widgetRef} className="min-h-12" />
          {status === "loading" ? <p className="text-sm text-muted">Проверяем вход...</p> : null}
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
