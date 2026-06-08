"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { authenticateTelegram } from "@/lib/api";
import { waitForTelegramInitData } from "@/lib/telegram";

const loadingText = "\u0412\u043e\u0441\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u043c \u0432\u0445\u043e\u0434 \u0447\u0435\u0440\u0435\u0437 Telegram...";
const retryText = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u0442\u044c\u0441\u044f \u043d\u0430\u043f\u0440\u044f\u043c\u0443\u044e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437 \u0438\u0437 \u0447\u0430\u0442\u0430 \u0441 \u0431\u043e\u0442\u043e\u043c.";
const localText = "\u0414\u043b\u044f \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u0442\u0435\u0441\u0442\u0430 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u043e\u0439\u0434\u0438\u0442\u0435 \u043a\u0430\u043a \u0442\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c.";
const localButton = "\u041b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u0445\u043e\u0434";

type NoticeState = "loading" | "outside_telegram" | "error";

export function LocalAuthNotice() {
  const [state, setState] = useState<NoticeState>("loading");

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const initData = await waitForTelegramInitData();

      if (!isMounted) {
        return;
      }

      if (!initData) {
        setState("outside_telegram");
        return;
      }

      try {
        const response = await authenticateTelegram(initData);
        sessionStorage.setItem("access_token", response.access_token);
        window.location.reload();
      } catch {
        if (isMounted) {
          setState("error");
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 text-sm shadow-sm">
      <p className="text-muted">
        {state === "loading" ? loadingText : state === "error" ? retryText : localText}
      </p>
      {state === "outside_telegram" ? (
        <Link className="mt-3 inline-flex rounded-md bg-ink px-4 py-2 font-medium text-white" href="/dev-login">
          {localButton}
        </Link>
      ) : null}
    </div>
  );
}
