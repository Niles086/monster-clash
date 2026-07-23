import { CardDefinition, TokenResponse } from "@/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail ?? `Request failed with status ${response.status}`);
  }
  return body as T;
}

export const api = {
  register: (email: string, displayName: string, password: string) =>
    request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, display_name: displayName, password }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  cards: () => request<CardDefinition[]>("/cards"),

  saveMatch: (
    token: string,
    result: {
      won: boolean;
      player_tower_health: number;
      enemy_tower_health: number;
      duration_seconds: number;
    }
  ) =>
    request("/matches", { method: "POST", body: JSON.stringify(result) }, token),
};
