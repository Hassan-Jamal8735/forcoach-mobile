import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/auth-types";
import { useAuth } from "../context/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../../assets/brand-logo.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logo}>FORCOACH</Text>
      <Text style={styles.subtitle}>Log in to your coaching account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.forgotLink}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.accentForeground} />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton />

      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupTextBold}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  logoImage: {
    width: 56,
    height: 56,
    alignSelf: "center",
    marginBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: colors.card,
    color: colors.foreground,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.card,
    paddingRight: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.foreground,
  },
  forgotLink: { alignSelf: "flex-end", marginTop: 8, marginBottom: 4 },
  forgotText: { fontSize: 13, color: colors.accent, fontWeight: "500" },
  error: {
    color: colors.destructiveText,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.accentForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  signupLink: { alignItems: "center", marginTop: 20 },
  signupText: { fontSize: 13, color: colors.mutedForeground },
  signupTextBold: { color: colors.accent, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.mutedForeground },
});
