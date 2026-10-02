import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getBillingStatus, type BillingStatus } from "../../lib/api/billing";
import { Badge, Banner, Card, Loading, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

const STATUS_LABEL: Record<BillingStatus["status"], { label: string; tone: "success" | "accent" | "danger" | "neutral" }> = {
  active: { label: "Active", tone: "success" },
  trialing: { label: "Free trial", tone: "accent" },
  past_due: { label: "Payment overdue", tone: "danger" },
  unpaid: { label: "Unpaid", tone: "danger" },
  canceled: { label: "Cancelled", tone: "neutral" },
  incomplete: { label: "Incomplete", tone: "neutral" },
  none: { label: "No plan", tone: "neutral" },
};

/** Read-only: plans are bought and managed outside the app (store rules). */
export function SubscriptionScreen() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getBillingStatus()
        .then(setStatus)
        .catch((e) => setError(e instanceof Error ? e.message : "Could not load your plan"));
    }, []),
  );

  if (!status && !error) return <Loading />;

  const s = STATUS_LABEL[status?.status ?? "none"];

  return (
    <StackScreen>
      {error && <Banner message={error} />}
      <Card>
        <View style={styles.row}>
          <Text style={styles.plan}>Coach Plan</Text>
          <Badge label={s.label} tone={s.tone} />
        </View>
        {status?.plan && <Text style={styles.meta}>Billed {status.plan === "yearly" ? "yearly" : "monthly"}</Text>}
        {status?.currentPeriodEnd && (
          <Text style={styles.meta}>
            {status.cancelAtPeriodEnd ? "Ends on " : "Renews on "}
            {new Date(status.currentPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          </Text>
        )}
      </Card>
      <Text style={styles.hint}>Your plan can't be changed in the app.</Text>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  plan: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  meta: { fontSize: 14, color: colors.mutedForeground, marginTop: 6 },
  hint: { fontSize: 13, color: colors.mutedForeground, marginLeft: 4 },
});
