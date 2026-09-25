import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/auth-types";
import { useAuth } from "../context/AuthContext";
import { AuthLayout, Divider } from "../components/AuthLayout";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { Banner, Button, Field } from "../components/ui";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) setError(error);
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your classes, earnings and invoices.">
      {error && <Banner message={error} />}
      <Field
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="Email address"
      />
      <Field icon="lock-closed-outline" value={password} onChangeText={setPassword} secure autoComplete="password" placeholder="Password" />
      <TouchableOpacity style={styles.forgot} onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <Button title="Log in" variant="dark" trailingIcon="arrow-forward" onPress={handleSubmit} loading={submitting} />
      <Divider />
      <GoogleSignInButton />

      <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.footerText}>
          Don't have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: "flex-end", marginBottom: 22, marginTop: -2 },
  forgotText: { color: colors.foreground, fontSize: 14, textDecorationLine: "underline" },
  link: { color: colors.foreground, fontWeight: "700", textDecorationLine: "underline" },
  footer: { alignItems: "center", marginTop: 28 },
  footerText: { fontSize: 14, color: colors.mutedForeground },
});
