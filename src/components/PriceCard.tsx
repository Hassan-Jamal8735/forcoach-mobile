import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Plan } from "../lib/api/billing";
import { Badge, Segmented } from "./ui";
import { colors } from "../theme/colors";

// Same figures as the website's pricing card (web/src/components/marketing/pricing-card.tsx).
export const PRICES: Record<Plan, { regular: number; promo: number; suffix: string }> = {
  monthly: { regular: 19.99, promo: 9, suffix: "/month" },
  yearly: { regular: 239.88, promo: 108, suffix: "/year" },
};

const FEATURES = [
  "Unlimited studios and classes",
  "Automatic calendar sync",
  "Earnings tracking, per studio and overall",
  "Unlimited branded invoices",
];

export function PriceCard({ plan, onPlanChange }: { plan: Plan; onPlanChange: (p: Plan) => void }) {
  const price = PRICES[plan];
  return (
    <View style={styles.card}>
      <View style={{ alignSelf: "center" }}>
        <Badge label="Early access price" tone="accent" />
      </View>
      <View style={styles.toggle}>
        <Segmented
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly" },
          ]}
          value={plan}
          onChange={onPlanChange}
        />
      </View>
      <Text style={styles.regular}>
        €{price.regular}
        {price.suffix}
      </Text>
      <View style={styles.promoRow}>
        <Text style={styles.promo}>€{price.promo}</Text>
        <Text style={styles.suffix}>{price.suffix}</Text>
      </View>
      <View style={{ alignSelf: "center", marginTop: 8 }}>
        <Badge label="15-day free trial" />
      </View>
      <Text style={styles.note}>Locked in for early users, even as the price rises for new sign-ups later.</Text>
      <View style={styles.divider} />
      {FEATURES.map((f) => (
        <View key={f} style={styles.feature}>
          <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
          <Text style={styles.featureText}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.accent,
    padding: 20,
    marginBottom: 16,
  },
  toggle: { marginTop: 14, marginBottom: 14 },
  regular: { textAlign: "center", fontSize: 17, color: colors.mutedForeground, textDecorationLine: "line-through" },
  promoRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 4 },
  promo: { fontSize: 52, fontWeight: "700", color: colors.foreground, letterSpacing: -1 },
  suffix: { fontSize: 17, color: colors.mutedForeground },
  note: { fontSize: 13, color: colors.mutedForeground, textAlign: "center", marginTop: 10, lineHeight: 18 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 16 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  featureText: { flex: 1, fontSize: 14, color: colors.foreground },
});
