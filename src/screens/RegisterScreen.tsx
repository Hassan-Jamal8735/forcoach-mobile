import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/auth-types";
import { supabase } from "../lib/supabase";
import { AuthLayout, Divider } from "../components/AuthLayout";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { Banner, Button, Field } from "../components/ui";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!fullName.trim()) return setError("Enter your name.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currency: "EUR",
        },
        emailRedirectTo: "https://forcoach.io/auth/callback?redirectTo=%2Fdashboard",
      },
    });
    setSubmitting(false);
    if (error) return setError(error.message);
    setSentTo(email.trim());
  }

  async function verifyCode() {
    setError(null);
    setInfo(null);
    const token = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(token)) return setError("Enter the 6-digit code from the email.");
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({ email: sentTo ?? "", token, type: "signup" });
    setSubmitting(false);
    // On success the auth listener picks up the new session and the app opens.
    if (error) setError("That code is invalid or has expired. Try again or resend the email.");
  }

  async function resend() {
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentTo ?? "",
      options: { emailRedirectTo: "https://forcoach.io/auth/callback?redirectTo=%2Fdashboard" },
    });
    if (error) setError(error.message);
    else setInfo("Confirmation email sent again.");
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a 6-digit code to ${sentTo}`}>
        {error && <Banner message={error} />}
        {info && <Banner tone="success" message={info} />}
        <Field
          label="Confirmation code"
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          style={{ fontSize: 22, letterSpacing: 8, textAlign: "center", fontWeight: "700" }}
        />
        <Button title="Confirm & continue" onPress={verifyCode} loading={submitting} disabled={code.length !== 6} />
        <Text style={styles.hint}>You can also tap the link in the email instead.</Text>
        <Button title="Resend email" variant="ghost" onPress={resend} />
        <Button title="Use a different email" variant="ghost" onPress={() => { setSentTo(null); setCode(""); setError(null); }} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start your 15-day free trial">
      {error && <Banner message={error} />}
      <Field label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" placeholder="Your name" />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Field label="Password" value={password} onChangeText={setPassword} secure hint="At least 8 characters" autoComplete="new-password" />
      <Button title="Create account" onPress={handleSubmit} loading={submitting} style={{ marginTop: 8 }} />
      <Divider />
      <GoogleSignInButton />
      <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accent, fontWeight: "700", fontSize: 14 },
  footer: { alignItems: "center", marginTop: 28 },
  footerText: { fontSize: 14, color: colors.mutedForeground },
  hint: { fontSize: 13, color: colors.mutedForeground, textAlign: "center", marginTop: 14 },
});
