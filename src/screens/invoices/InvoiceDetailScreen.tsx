import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "../../navigation/invoices-types";
import { deleteInvoice, generateInvoice, getInvoice, type InvoiceDetail } from "../../lib/api/invoices";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoiceDetail">;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function InvoiceDetailScreen({ route, navigation }: Props) {
  const { invoiceId } = route.params;
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getInvoice(invoiceId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load this invoice");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleGenerate() {
    setBusy(true);
    try {
      await generateInvoice(invoiceId);
      await load();
    } catch (err) {
      Alert.alert("Couldn't generate invoice", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete invoice", "This can't be undone. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await deleteInvoice(invoiceId);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Couldn't delete", err instanceof Error ? err.message : "Please try again.");
            setBusy(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? "Invoice not found"}</Text>
      </View>
    );
  }

  const { invoice, lineItems } = detail;
  const isDraft = invoice.status === "draft";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.invoiceNumber}>{invoice.invoice_number ?? "Draft invoice"}</Text>
        <Text style={styles.total}>€{invoice.total.toFixed(2)}</Text>
      </View>
      <Text style={styles.studioName}>{invoice.studio_name}</Text>
      <Text style={styles.period}>
        {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)} · Due {formatDate(invoice.due_date)}
      </Text>

      <View style={styles.lineItems}>
        {lineItems.map((item) => (
          <View key={item.id} style={styles.lineItem}>
            <View style={styles.lineItemLeft}>
              <Text style={styles.lineItemTitle}>{item.title}</Text>
              <Text style={styles.lineItemDate}>{formatDate(item.event_date)}</Text>
            </View>
            <Text style={styles.lineItemAmount}>€{item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>€{invoice.subtotal.toFixed(2)}</Text>
        </View>
        {invoice.vat_rate != null && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT ({invoice.vat_rate}%)</Text>
            <Text style={styles.summaryValue}>€{invoice.vat_amount.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>€{invoice.total.toFixed(2)}</Text>
        </View>
      </View>

      {isDraft && (
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.offWhite} />
          ) : (
            <Text style={styles.generateBtnText}>Generate invoice</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleDelete} disabled={busy} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>Delete invoice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: colors.destructiveText, fontSize: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  invoiceNumber: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  total: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  studioName: { fontSize: 15, color: colors.foreground, marginTop: 4 },
  period: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, marginBottom: 20 },
  lineItems: { borderTopWidth: 1, borderColor: colors.border },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  lineItemLeft: { flex: 1 },
  lineItemTitle: { fontSize: 14, color: colors.foreground },
  lineItemDate: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  lineItemAmount: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  summary: { marginTop: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: colors.mutedForeground },
  summaryValue: { fontSize: 13, color: colors.foreground },
  summaryTotalRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 8, marginTop: 4 },
  summaryTotalLabel: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  summaryTotalValue: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  generateBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  generateBtnText: { color: colors.offWhite, fontSize: 15, fontWeight: "600" },
  deleteBtn: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  deleteText: { color: colors.destructive, fontSize: 14, fontWeight: "500" },
});
