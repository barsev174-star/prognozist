const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type UserProfile = {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  points_total: number;
  premium_until: string | null;
  is_blocked: boolean;
  created_at: string;
};

export type VipStatus = {
  is_active: boolean;
  premium_until: string | null;
  stars_amount: number;
  duration_days: number;
  invite_link: string | null;
  channel_enabled: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: UserProfile;
};

export type TelegramBrowserAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export type Question = {
  id: number;
  match_id: number;
  slot: number | null;
  text: string;
  correct_answer: boolean | null;
  points: number;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: number;
  tournament_id: number;
  team_1_id?: number | null;
  team_2_id?: number | null;
  team_1: string;
  team_2: string;
  team_1_logo: string | null;
  team_2_logo: string | null;
  start_time: string;
  status: string;
  team_1_score: number | null;
  team_2_score: number | null;
  created_at: string;
  updated_at: string;
  user_prediction_submitted: boolean | null;
  user_public_answers_count: number | null;
  user_vip_answer_submitted: boolean | null;
  public_questions_count: number | null;
  vip_question_exists: boolean | null;
  questions_complete: boolean | null;
};

export type MatchDetail = Match & {
  public_questions: Question[];
  public_question: Question | null;
  vip_question: Question | null;
  vip_question_locked: boolean;
};

export type MatchPointsBreakdownItem = {
  type: string;
  title: string;
  user_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  points_awarded: number;
  max_points: number;
};

export type MatchPointsBreakdown = {
  match_id: number;
  total_points: number;
  items: MatchPointsBreakdownItem[];
};

export type Prediction = {
  id: number;
  user_id: number;
  match_id: number;
  predicted_team_1_score: number;
  predicted_team_2_score: number;
  points_awarded: number;
  is_exact_score: boolean;
  is_outcome_correct: boolean;
  created_at: string;
  updated_at: string;
};

export type RankingEntry = {
  rank: number;
  user_id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  points: number;
  is_current_user: boolean;
};

export type RankingResponse = {
  entries: RankingEntry[];
  current_user_entry: RankingEntry | null;
};

export type League = {
  id: number;
  owner_id: number;
  tournament_id: number;
  name: string;
  description: string | null;
  prize_description: string | null;
  invite_code: string;
  status: string;
  members_count: number;
  is_owner: boolean;
  is_member: boolean;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
};

export type Tournament = {
  id: number;
  season_id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: number;
  slug: string;
  name: string;
  short_name: string | null;
  fifa_code: string | null;
  flag_emoji: string | null;
  logo_url: string | null;
  confederation: string;
  status: string;
  is_national_team: boolean;
  is_placeholder: boolean;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionOption = {
  id: number;
  question_id: number;
  team_id: number | null;
  label: string;
  sort_order: number;
  team: Team | null;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionResult = {
  id: number;
  question_id: number;
  correct_option_id: number | null;
  correct_text: string | null;
  resolved_by_user_id: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionResolutionSummary = {
  total_predictions: number;
  correct_predictions: number;
  total_points_awarded: number;
};

export type TournamentPrediction = {
  id: number;
  question_id: number;
  user_id: number;
  selected_option_id: number | null;
  free_text: string | null;
  points_awarded: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionQuestion = {
  id: number;
  tournament_id: number;
  code: string;
  title: string;
  description: string | null;
  option_type: "team" | "player" | "custom";
  status: "draft" | "active" | "locked" | "resolved" | "cancelled";
  points: number;
  lock_at: string | null;
  resolved_at: string | null;
  options: TournamentPredictionOption[];
  result: TournamentPredictionResult | null;
  resolution_summary: TournamentPredictionResolutionSummary | null;
  created_at: string;
  updated_at: string;
};

export type TournamentPredictionQuestionWithUserPrediction = TournamentPredictionQuestion & {
  user_prediction: TournamentPrediction | null;
};

export type TournamentPredictionPendingSummary = {
  tournament_id: number;
  pending_questions_count: number;
  total_questions_count: number;
};

export type AdminSystemLog = {
  id: number;
  event_type: string;
  user_id: number | null;
  telegram_id: number | null;
  username: string | null;
  first_name: string | null;
  payload_json: Record<string, unknown> | null;
  created_at: string;
};

export type AdminPointsLog = {
  id: number;
  user_id: number;
  telegram_id: number | null;
  username: string | null;
  first_name: string | null;
  source_type: string;
  source_id: number;
  points: number;
  created_at: string;
};

export type ReferralStats = {
  referral_link: string;
  registered_count: number;
  activated_count: number;
  referral_points: number;
  next_reward_at: number | null;
  next_reward_points: number | null;
};

export type SupportRequestPayload = {
  category: "bug" | "idea" | "question" | "payment";
  message: string;
};

export type SupportRequestResponse = {
  status: string;
  category: "bug" | "idea" | "question" | "payment";
  created_at: string;
};

export type StarAmount = {
  amount: number;
  nanostar_amount: number | null;
};

export type AdminStarTransaction = {
  id: string;
  amount: number;
  nanostar_amount: number | null;
  is_refund: boolean;
  created_at: string;
  partner_type: string;
  transaction_type: string | null;
  title: string;
};

export type AdminStarsSummary = {
  balance: StarAmount;
  transactions: AdminStarTransaction[];
  incoming_total: number;
  outgoing_total: number;
};

function getToken(): string | null {
  return typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function apiDelete(path: string): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
}

export async function authenticateTelegram(initData: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ init_data: initData })
  });

  if (!response.ok) {
    throw new Error(`Telegram auth failed: ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
}

export async function authenticateTelegramBrowserAdmin(payload: TelegramBrowserAuthPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/telegram-browser-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Telegram browser admin auth failed: ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiGet<UserProfile>("/users/me");
}

export async function authenticateDev(telegramId: number, profile?: { username?: string; first_name?: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/dev`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      telegram_id: telegramId,
      username: profile?.username ?? `player_${telegramId}`,
      first_name: profile?.first_name ?? `Игрок ${telegramId}`
    })
  });

  if (!response.ok) {
    throw new Error(`Dev auth failed: ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
}

export function hasAccessToken(): boolean {
  return Boolean(getToken());
}
