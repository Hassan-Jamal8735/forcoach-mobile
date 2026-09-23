import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithGoogle } from "../lib/google-auth";
import { colors } from "../theme/colors";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) setError(error);
  }

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#4285F4" />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.card,
  },
  buttonText: { color: colors.foreground, fontSize: 15, fontWeight: "600" },
  error: { color: colors.destructiveText, fontSize: 13, marginTop: 8, textAlign: "center" },
});
