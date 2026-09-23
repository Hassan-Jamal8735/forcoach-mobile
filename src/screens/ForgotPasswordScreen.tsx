import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/auth-types";
import { supabase } from "../lib/supabase";
import { AuthLayout } from "../components/AuthLayout";
import { Banner, Button, EmptyState, Field } from "../components/ui";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "https://forcoach.io/auth/callback?redirectTo=%2Freset-password",
    });
    setSubmitting(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <AuthLayout
      title={sent ? "Check your email" : "Reset password"}
      subtitle={sent ? `If an account exists for ${email.trim()}, a reset link is on its way.` : "We'll email you a link to set a new password."}
    >
      {sent ? (
        <EmptyState icon="mail-unread-outline" title="Link sent" subtitle="Open it on this phone to choose a new password, then log in here." />
      ) : (
        <>
          {error && <Banner message={error} />}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Button title="Send reset link" onPress={handleSubmit} loading={submitting} style={{ marginTop: 8 }} />
        </>
      )}
      <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Back to login</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accent, fontWeight: "700", fontSize: 14 },
  footer: { alignItems: "center", marginTop: 28 },
});
