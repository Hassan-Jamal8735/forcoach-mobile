import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { GoogleLogo } from "./GoogleLogo";
import { Banner } from "./ui";
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
      {error && <Banner message={error} />}
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading} activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (
          <>
            <GoogleLogo />
            <Text style={styles.text}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  text: { fontSize: 15, fontWeight: "700", color: colors.foreground },
});
