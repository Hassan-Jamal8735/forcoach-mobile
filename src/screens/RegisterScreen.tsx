import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/auth-types";
import { supabase } from "../lib/supabase";
import { AuthLayout, Divider } from "../components/AuthLayout";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { Banner, Button, EmptyState, Field } from "../components/ui";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  if (sentTo) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a confirmation link to ${sentTo}`}>
        <EmptyState icon="mail-unread-outline" title="Almost there" subtitle="Open the link to confirm your address, then come back and log in." />
        <Button title="Back to login" onPress={() => navigation.navigate("Login")} />
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
});
