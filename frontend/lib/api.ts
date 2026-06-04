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

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: UserProfile;
};

export type Question = {
  id: number;
  match_id: number;
  text: string;
  correct_answer: boolean | null;
  points: number;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: number;
  tournament_id: number;
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
};

export type MatchDetail = Match & {
  public_question: Question | null;
  vip_question: Question | null;
  vip_question_locked: boolean;
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

export async function authenticateDev(telegramId: number): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/dev`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      telegram_id: telegramId,
      username: "dev_admin",
      first_name: "Dev Admin"
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
