import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingHeader } from "../../components/OnboardingHeader";
import { createCheckoutSession, type Plan } from "../../lib/api/billing";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ChoosePlan">;

const FEATURES = [
  "Sync all your studios",
  "Track your schedule & earnings",
  "Create and download invoices",
  "Access on web & mobile",
  "15-day free trial",
];

export function ChoosePlanScreen({ navigation }: Props) {
  const [plan, setPlan] = useState<Plan>("monthly");
  const [loading, setLoading] = useState(false);

  async function handleStartTrial() {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(plan);
      await Linking.openURL(url);
      navigation.navigate("Done");
    } catch (err) {
      Alert.alert(
        "Couldn't start checkout",
        err instanceof Error ? err.message : "Please try again from Settings later.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <OnboardingHeader step={5} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.subtitle}>Start your 15-day free trial. Cancel anytime.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Coach Plan</Text>
            <Text style={styles.cardPrice}>
              €{plan === "monthly" ? "9" : "108"} / {plan === "monthly" ? "month" : "year"}
            </Text>
          </View>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, plan === "monthly" && styles.toggleBtnActive]}
            onPress={() => setPlan("monthly")}
          >
            <Text style={[styles.toggleText, plan === "monthly" && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, plan === "yearly" && styles.toggleBtnActive]}
            onPress={() => setPlan("yearly")}
          >
            <Text style={[styles.toggleText, plan === "yearly" && styles.toggleTextActive]}>
              Yearly · Save 20%
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleStartTrial} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.offWhite} />
        ) : (
          <Text style={styles.nextBtnText}>Start free trial  →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 20 },
  card: {
    backgroundColor: colors.accentLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  cardPrice: { fontSize: 15, fontWeight: "700", color: colors.accent },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  check: { color: colors.accent, fontWeight: "700" },
  featureText: { fontSize: 13, color: colors.foreground },
  toggleRow: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 10, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  toggleBtnActive: { backgroundColor: colors.card },
  toggleText: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
  toggleTextActive: { color: colors.foreground },
  nextBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  nextBtnText: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
});
