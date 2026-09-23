import { supabase } from "../supabase";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  // getSession() returns whatever is cached in storage without checking
  // expiry — if the app was closed long enough for the access token to
  // expire, the background auto-refresh timer never got a chance to run.
  // Refresh explicitly whenever it's expired or about to expire.
  const expiresAtMs = (session.expires_at ?? 0) * 1000;
  const isExpiringSoon = expiresAtMs - Date.now() < 60_000;
  if (!isExpiringSoon) return session.access_token;

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error || !refreshed.session) {
    // Refresh token itself is dead — there's no way back without a fresh
    // login, so sign out cleanly rather than leaving broken screens up.
    await supabase.auth.signOut();
    return null;
  }
  return refreshed.session.access_token;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new ApiError(401, "Not authenticated");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? "Request failed");
    throw new ApiError(res.status, message);
  }

  return body as T;
}
