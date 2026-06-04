export function isTelegramMiniApp(): boolean {
  return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp);
}

export function getTelegramInitData(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp?.initData ?? null;
}

export async function waitForTelegramInitData(timeoutMs = 10000): Promise<string | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const initData = getTelegramInitData();
    if (initData) {
      return initData;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return getTelegramInitData();
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
      };
    };
  }
}
