import type { Match } from "@/lib/api";

const labels = {
  completed: "\u041c\u0430\u0442\u0447 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d, \u0431\u0430\u043b\u043b\u044b \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u044b",
  live: "\u0418\u0434\u0435\u0442 \u043c\u0430\u0442\u0447",
  calculating: "\u041e\u0436\u0438\u0434\u0430\u043d\u0438\u0435 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f \u0431\u0430\u043b\u043b\u043e\u0432",
  upcoming: "\u0411\u0443\u0434\u0443\u0449\u0438\u0439",
};

export function isMatchArchived(match: Match): boolean {
  return match.status === "completed";
}

export function isPredictionLocked(match: Match): boolean {
  return match.status !== "upcoming" || new Date(match.start_time).getTime() <= Date.now();
}

export function getMatchStatusMeta(match: Match): { label: string; dotClassName: string; textClassName: string } {
  if (match.status === "completed") {
    return {
      label: labels.completed,
      dotClassName: "bg-neutral-400",
      textClassName: "text-neutral-600",
    };
  }

  if (match.status === "live") {
    return {
      label: labels.live,
      dotClassName: "bg-red-500",
      textClassName: "text-red-700",
    };
  }

  if (match.status === "calculating" || new Date(match.start_time).getTime() <= Date.now()) {
    return {
      label: labels.calculating,
      dotClassName: "bg-amber-500",
      textClassName: "text-amber-700",
    };
  }

  return {
    label: labels.upcoming,
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
