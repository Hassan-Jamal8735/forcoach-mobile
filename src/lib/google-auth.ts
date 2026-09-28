import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

// Mirrors the web app's Google sign-in (web/src/app/(auth)/google-signin-button.tsx):
// same PKCE code-exchange flow, just driven from a browser sheet instead of a
// full-page redirect since there's no address bar on mobile.
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const redirectTo = Linking.createURL("/auth/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    return { error: error?.message ?? "Could not start Google sign-in" };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    return { error: null }; // User cancelled — not an error.
  }

  const url = new URL(result.url);
  const code = url.searchParams.get("code");
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    return { error: exchangeError?.message ?? null };
  }

  // Fallback for the token-in-fragment style (#access_token=...&refresh_token=...).
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    return { error: sessionError?.message ?? null };
  }

  const reason = url.searchParams.get("error_description") ?? hash.get("error_description");
  return { error: reason ?? "Google sign-in didn't complete. Please try again." };
}
