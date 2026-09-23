import { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { createCheckoutSession, getBillingStatus, type Plan } from "../../lib/api/billing";
import { Banner, Button, Segmented } from "../../components/ui";
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
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBillingStatus()
      .then((s) => setSubscribed(["active", "trialing"].includes(s.status)))
      .catch(() => {});
  }, []);

  async function handleStartTrial() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(plan);
      await Linking.openURL(url);
      navigation.navigate("Done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start checkout — you can do this later from Settings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingLayout
      step={5}
      onBack={() => navigation.goBack()}
      title="Choose your plan"
      subtitle="Start your 15-day free trial. Cancel anytime."
      footer={
        subscribed ? (
          <Button title="Next" icon="arrow-forward" variant="dark" onPress={() => navigation.navigate("Done")} />
        ) : (
          <>
            <Button title="Start free trial" icon="arrow-forward" variant="dark" onPress={handleStartTrial} loading={loading} />
            <Button title="Decide later" variant="ghost" onPress={() => navigation.navigate("Done")} />
          </>
        )
      }
    >
      {error && <Banner message={error} />}
      {subscribed && <Banner tone="success" message="You're already subscribed — nothing to do here." />}

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Coach Plan</Text>
          <Text style={styles.price}>
            €{plan === "monthly" ? "9" : "108"}
            <Text style={styles.per}> / {plan === "monthly" ? "month" : "year"}</Text>
          </Text>
        </View>
        {FEATURES.map((f) => (
          <View key={f} style={styles.feature}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {!subscribed && (
        <Segmented
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly · save 20%" },
          ]}
          value={plan}
          onChange={setPlan}
        />
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 20,
    marginBottom: 20,
    gap: 10,
  },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: colors.foreground },
  price: { fontSize: 22, fontWeight: "800", color: colors.accent },
  per: { fontSize: 14, fontWeight: "600", color: colors.mutedForeground },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 15, color: colors.foreground },
});
