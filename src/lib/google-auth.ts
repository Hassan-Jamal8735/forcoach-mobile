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

  const { queryParams } = Linking.parse(result.url);
  const code = queryParams?.code;
  if (!code || typeof code !== "string") {
    return { error: "Google sign-in did not return a valid code." };
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return { error: exchangeError.message };
  }
  return { error: null };
}
