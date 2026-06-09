import type { Match, TournamentPredictionPendingSummary, UserProfile } from "@/lib/api";
import { isMatchArchived, isPredictionLocked } from "@/lib/matchStatus";


export function hasActiveVip(user: UserProfile): boolean {
  if (!user.premium_until) {
    return false;
  }

  return new Date(user.premium_until).getTime() > Date.now();
}


export function getPendingMatchActionsCount(match: Match, canAnswerVip: boolean): number {
  if (isPredictionLocked(match)) {
    return 0;
  }

  let count = 0;

  if (!match.user_prediction_submitted) {
    count += 1;
  }

  const publicQuestionsCount = match.public_questions_count ?? 0;
  const publicAnswersCount = match.user_public_answers_count ?? 0;
  count += Math.max(publicQuestionsCount - publicAnswersCount, 0);

  if (canAnswerVip && match.vip_question_exists && !match.user_vip_answer_submitted) {
    count += 1;
  }

  return count;
}


export function getPendingActiveMatchesCount(matches: Match[], canAnswerVip: boolean): number {
  return matches.filter((match) => !isMatchArchived(match) && getPendingMatchActionsCount(match, canAnswerVip) > 0).length;
}


export function getPendingTournamentQuestionsCount(rows: TournamentPredictionPendingSummary[]): number {
  return rows.reduce((total, row) => total + row.pending_questions_count, 0);
}
