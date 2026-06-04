import type { Match } from "@/lib/api";

export function isMatchArchived(match: Match): boolean {
  return match.status === "completed";
}

export function isPredictionLocked(match: Match): boolean {
  return match.status !== "upcoming" || new Date(match.start_time).getTime() <= Date.now();
}

export function getMatchStatusMeta(match: Match): { label: string; dotClassName: string; textClassName: string } {
  if (match.status === "completed") {
    return {
      label: "Матч завершен, баллы начислены",
      dotClassName: "bg-neutral-400",
      textClassName: "text-neutral-600",
    };
  }

  if (match.status === "live") {
    return {
      label: "Идет матч",
      dotClassName: "bg-red-500",
      textClassName: "text-red-700",
    };
  }

  if (match.status === "calculating" || new Date(match.start_time).getTime() <= Date.now()) {
    return {
      label: "Матч завершен, идет начисление баллов",
      dotClassName: "bg-amber-500",
      textClassName: "text-amber-700",
    };
  }

  return {
    label: "Будущий",
    dotClassName: "bg-emerald-500",
    textClassName: "text-emerald-700",
  };
}

export function formatMatchDate(value: string): string {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
