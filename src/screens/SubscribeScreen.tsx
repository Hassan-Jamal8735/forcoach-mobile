import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getBillingStatus } from "../lib/api/billing";
import { BrandLogo } from "../components/BrandLogo";
import { Banner, Button } from "../components/ui";
import { colors } from "../theme/colors";

/**
 * Shown instead of the app when the account has no active plan. Plans are
 * bought outside the app, so this screen deliberately has no prices, purchase
 * buttons or links to a payment page (App Store / Play Store rules).
 */
export function SubscribeScreen({ onAccessGranted }: { onAccessGranted: () => void }) {
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      const status = await getBillingStatus();
      if (status.hasAccess) onAccessGranted();
      else setError("There's no active plan on this account yet.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't check your plan. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.center}>
        <BrandLogo size="sm" />
        <View style={styles.icon}>
          <Ionicons name="lock-closed-outline" size={30} color={colors.accent} />
        </View>
        <Text style={styles.title}>No active plan</Text>
        <Text style={styles.subtitle}>
          {session?.user.email} doesn't have an active FORCOACH plan. Plans can't be purchased in the app. Once your
          plan is active, tap Refresh.
        </Text>
        {error && (
          <View style={{ alignSelf: "stretch" }}>
            <Banner message={error} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button title="Refresh" icon="refresh" variant="dark" onPress={refresh} loading={busy} />
        <View style={styles.links}>
          <Text style={styles.link} onPress={() => Linking.openURL("mailto:contact@forcoach.io")}>
            Contact support
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text
            style={styles.link}
            onPress={() =>
              Alert.alert("Log out", `Log out of ${session?.user.email ?? "your account"}?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Log out", style: "destructive", onPress: signOut },
              ])
            }
          >
            Log out
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.mutedForeground, textAlign: "center", marginTop: 10, marginBottom: 20, lineHeight: 22 },
  footer: { paddingHorizontal: 20, paddingBottom: 8, gap: 4 },
  links: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 12 },
  link: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
  dot: { color: colors.mutedForeground },
});
