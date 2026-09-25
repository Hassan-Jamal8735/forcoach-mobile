import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { createCheckoutSession, getBillingStatus, waitForActiveSubscription, type Plan } from "../lib/api/billing";
import { runReturnFlow } from "../lib/return-flow";
import { BrandLogo } from "../components/BrandLogo";
import { Banner, Button } from "../components/ui";
import { PriceCard } from "../components/PriceCard";
import { colors } from "../theme/colors";


/** Shown instead of the app when the coach has no active plan or trial. */
export function SubscribeScreen({ onAccessGranted }: { onAccessGranted: () => void }) {
  const { session, signOut } = useAuth();
  const [plan, setPlan] = useState<Plan>("monthly");
  const [busy, setBusy] = useState<"checkout" | "refresh" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startTrial() {
    setBusy("checkout");
    setError(null);
    try {
      const result = await runReturnFlow((returnTo) => createCheckoutSession(plan, returnTo));
      const started = await waitForActiveSubscription(result?.billing === "success" ? 10000 : 1500);
      if (started) onAccessGranted();
      else setError("Checkout wasn't completed, so your trial hasn't started yet.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open checkout. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function refresh() {
    setBusy("refresh");
    setError(null);
    try {
      const status = await getBillingStatus();
      if (status.hasAccess) onAccessGranted();
      else setError("We couldn't find an active plan or trial on this account yet.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't check your plan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logo}>
          <BrandLogo size="sm" />
        </View>
        <Text style={styles.title}>Start your free trial</Text>
        <Text style={styles.subtitle}>
          15 days free, cancel anytime. You won't be charged before the trial ends.
        </Text>

        {error && <Banner message={error} />}

        <PriceCard plan={plan} onPlanChange={setPlan} />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start 15-day free trial" icon="arrow-forward" onPress={startTrial} loading={busy === "checkout"} />
        <Button title="I've already subscribed" variant="ghost" onPress={refresh} loading={busy === "refresh"} />
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
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  logo: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 28, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.mutedForeground, textAlign: "center", marginTop: 8, marginBottom: 24, lineHeight: 21 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 20,
    gap: 14,
    marginBottom: 20,
  },
  feature: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureText: { flex: 1, fontSize: 15, color: colors.foreground },
  footer: { paddingHorizontal: 20, paddingBottom: 8, gap: 4 },
  links: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 8 },
  link: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
  dot: { color: colors.mutedForeground },
});
