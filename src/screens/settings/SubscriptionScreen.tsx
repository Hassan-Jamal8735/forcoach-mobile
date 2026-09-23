import { useCallback, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  createCheckoutSession,
  createPortalSession,
  getBillingStatus,
  type BillingStatus,
  type Plan,
} from "../../lib/api/billing";
import { Badge, Banner, Button, Card, Loading, Segmented, StackScreen } from "../../components/ui";
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

export function SubscriptionScreen() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [plan, setPlan] = useState<Plan>("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getBillingStatus()
        .then(setStatus)
        .catch((e) => setError(e instanceof Error ? e.message : "Could not load your subscription"));
    }, []),
  );

  async function open(fn: () => Promise<{ url: string }>) {
    setBusy(true);
    setError(null);
    try {
      const { url } = await fn();
      await Linking.openURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!status && !error) return <Loading />;

  const hasPlan = !!status && ["active", "trialing", "past_due", "unpaid"].includes(status.status);
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

      {hasPlan ? (
        <>
          <Button title="Manage billing" icon="open-outline" onPress={() => open(createPortalSession)} loading={busy} />
          <Text style={styles.hint}>
            Update your card, switch plan, download receipts or cancel — opens Stripe securely.
          </Text>
        </>
      ) : (
        <>
          <Segmented
            options={[
              { value: "monthly", label: "Monthly · €9" },
              { value: "yearly", label: "Yearly · €108" },
            ]}
            value={plan}
            onChange={setPlan}
          />
          <View style={{ height: 16 }} />
          <Button title="Start 15-day free trial" onPress={() => open(() => createCheckoutSession(plan))} loading={busy} />
          <Text style={styles.hint}>You won't be charged until the trial ends. Cancel anytime.</Text>
        </>
      )}
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  plan: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  meta: { fontSize: 14, color: colors.mutedForeground, marginTop: 6 },
  hint: { fontSize: 12, color: colors.mutedForeground, textAlign: "center", marginTop: 10 },
});
