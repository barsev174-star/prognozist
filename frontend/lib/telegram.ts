export function isTelegramMiniApp(): boolean {
  return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp);
}

export function getTelegramInitData(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp?.initData ?? null;
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
