import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "../../navigation/invoices-types";
import { listInvoices, type Invoice } from "../../lib/api/invoices";
import { useCurrency } from "../../lib/currency";
import { Badge, Banner, Button, EmptyState, Loading, Screen, ScreenHeader, Segmented } from "../../components/ui";
import { colors, cardShadow } from "../../theme/colors";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoicesList">;
type Filter = "all" | "draft" | "generated";

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function InvoicesListScreen({ navigation }: Props) {
  const { format } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setInvoices(await listInvoices());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load invoices");
      setInvoices((prev) => prev ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!invoices) return <Loading />;

  const visible = invoices.filter((i) => (filter === "all" ? i.status !== "archived" : i.status === filter));
  const drafts = invoices.filter((i) => i.status === "draft").length;

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}
      footer={<Button title="Create invoice" icon="add" onPress={() => navigation.navigate("CreateInvoice")} />}
    >
      <ScreenHeader title="Invoices" subtitle={drafts ? `${drafts} draft${drafts === 1 ? "" : "s"} waiting` : undefined} />
      <Segmented
        options={[
          { value: "all", label: "All" },
          { value: "draft", label: "Drafts" },
          { value: "generated", label: "Generated" },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <View style={{ height: 16 }} />
      {error && <Banner message={error} />}

      {visible.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={filter === "draft" ? "No drafts" : "No invoices yet"}
          subtitle="Create an invoice for a studio and date range. Your classes are added automatically."
        />
      ) : (
        visible.map((inv) => (
          <TouchableOpacity
            key={inv.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: inv.id })}
          >
            <View style={styles.icon}>
              <Ionicons name={inv.status === "draft" ? "document-outline" : "document-text"} size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.number}>{inv.invoice_number ?? "Draft"}</Text>
              <Text style={styles.studio} numberOfLines={1}>
                {inv.studio_name}
              </Text>
              <Text style={styles.period}>
                {shortDate(inv.period_start)} to {shortDate(inv.period_end)}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{format(inv.total)}</Text>
              <Badge label={inv.status === "draft" ? "Draft" : "Generated"} tone={inv.status === "draft" ? "neutral" : "success"} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...cardShadow,
  },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.accentLight, alignItems: "center", justifyContent: "center" },
  number: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  studio: { fontSize: 13, color: colors.foreground, marginTop: 2 },
  period: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 16, fontWeight: "800", color: colors.foreground },
});
