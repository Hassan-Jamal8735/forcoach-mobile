import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "../../navigation/invoices-types";
import {
  deleteInvoice,
  downloadInvoicePdf,
  generateInvoice,
  getInvoice,
  updateLineItemRate,
  type InvoiceDetail,
  type InvoiceLineItem,
} from "../../lib/api/invoices";
import { useCurrency } from "../../lib/currency";
import { Badge, Banner, Button, Card, Loading, SectionLabel, StackScreen } from "../../components/ui";
import { PromptSheet } from "../../components/PromptSheet";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoiceDetail">;

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function InvoiceDetailScreen({ route, navigation }: Props) {
  const { invoiceId } = route.params;
  const { format, symbol } = useCurrency();
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; msg: string } | null>(null);
  const [editing, setEditing] = useState<InvoiceLineItem | null>(null);

  const load = useCallback(async () => {
    try {
      setDetail(await getInvoice(invoiceId));
    } catch (e) {
      setNotice({ tone: "danger", msg: e instanceof Error ? e.message : "Could not load this invoice" });
    }
  }, [invoiceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function run(key: string, fn: () => Promise<void>, success?: string) {
    setBusy(key);
    setNotice(null);
    try {
      await fn();
      if (success) setNotice({ tone: "success", msg: success });
    } catch (e) {
      setNotice({ tone: "danger", msg: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setBusy(null);
    }
  }

  function saveRate(value: string) {
    const item = editing;
    setEditing(null);
    if (!item) return;
    const rate = Number(value.replace(",", "."));
    if (Number.isNaN(rate) || rate < 0) {
      setNotice({ tone: "danger", msg: "Enter a valid rate." });
      return;
    }
    run(`rate-${item.id}`, async () => {
      await updateLineItemRate(invoiceId, item.id, rate);
      await load();
    });
  }

  function confirmGenerate() {
    Alert.alert(
      "Generate invoice?",
      "This gives it a permanent invoice number. Lines can't be changed afterwards.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () =>
            run(
              "generate",
              async () => {
                await generateInvoice(invoiceId);
                await load();
              },
              "Invoice generated.",
            ),
        },
      ],
    );
  }

  const sharePdf = () =>
    run("pdf", async () => {
      if (!detail) return;
      const uri = await downloadInvoicePdf(detail.invoice);
      if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing isn't available on this device.");
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Share invoice" });
    });

  function confirmDelete() {
    Alert.alert("Delete this draft?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          run("delete", async () => {
            await deleteInvoice(invoiceId);
            navigation.goBack();
          }),
      },
    ]);
  }

  if (!detail) return notice ? <StackScreen><Banner message={notice.msg} /></StackScreen> : <Loading />;

  const { invoice, lineItems } = detail;
  const isDraft = invoice.status === "draft";

  return (
    <StackScreen
      footer={
        isDraft ? (
          <Button title="Generate invoice" icon="checkmark-done" onPress={confirmGenerate} loading={busy === "generate"} />
        ) : (
          <Button title="Share PDF" icon="share-outline" onPress={sharePdf} loading={busy === "pdf"} />
        )
      }
    >
      {notice && <Banner tone={notice.tone} message={notice.msg} />}

      <Card>
        <View style={styles.headRow}>
          <Text style={styles.number}>{invoice.invoice_number ?? "Draft invoice"}</Text>
          <Badge label={isDraft ? "Draft" : "Generated"} tone={isDraft ? "neutral" : "success"} />
        </View>
        <Text style={styles.total}>{format(invoice.total)}</Text>
        <Text style={styles.studio}>{invoice.studio_name}</Text>
        <View style={styles.metaRow}>
          <Meta icon="calendar-outline" text={`${longDate(invoice.period_start)} to ${longDate(invoice.period_end)}`} />
          <Meta icon="time-outline" text={`Due ${longDate(invoice.due_date)}`} />
        </View>
      </Card>

      <SectionLabel>{`Classes (${lineItems.length})`}</SectionLabel>
      <Card padded={false}>
        {lineItems.map((item, i) => (
          <TouchableOpacity
            key={item.id}
            disabled={!isDraft}
            onPress={() => setEditing(item)}
            style={[styles.line, i < lineItems.length - 1 && styles.lineDivider]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.lineTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.lineMeta}>
                {longDate(item.event_date)} ·{" "}
                {item.compensation_type === "hourly" ? `${Number(item.hours.toFixed(2))}h × ${symbol}${item.rate}` : `${symbol}${item.rate} / class`}
              </Text>
            </View>
            <Text style={styles.lineAmount}>{format(item.amount)}</Text>
            {isDraft && <Ionicons name="create-outline" size={18} color={colors.accent} />}
          </TouchableOpacity>
        ))}
      </Card>
      {isDraft && <Text style={styles.hint}>Tap a class to adjust its rate before generating.</Text>}

      <Card>
        <Row label="Subtotal" value={format(invoice.subtotal)} />
        {invoice.vat_rate != null && <Row label={`VAT (${invoice.vat_rate}%)`} value={format(invoice.vat_amount)} />}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{format(invoice.total)}</Text>
        </View>
      </Card>

      {isDraft ? (
        <View style={styles.secondaryActions}>
          <Button title="Preview PDF" variant="secondary" icon="document-outline" onPress={sharePdf} loading={busy === "pdf"} style={{ flex: 1 }} />
          <Button title="Delete" variant="destructive" icon="trash-outline" onPress={confirmDelete} loading={busy === "delete"} style={{ flex: 1 }} />
        </View>
      ) : null}

      <PromptSheet
        visible={!!editing}
        title="Adjust rate"
        subtitle={editing ? `${editing.title} · ${longDate(editing.event_date)}` : undefined}
        label={editing?.compensation_type === "hourly" ? `Rate per hour (${symbol})` : `Rate per class (${symbol})`}
        initialValue={editing ? String(editing.rate) : ""}
        keyboardType="decimal-pad"
        onCancel={() => setEditing(null)}
        onSubmit={saveRate}
      />
    </StackScreen>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.mutedForeground} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sumRow}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={styles.sumValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  number: { fontSize: 15, fontWeight: "700", color: colors.mutedForeground },
  total: { fontSize: 34, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5, marginTop: 6 },
  studio: { fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 2 },
  metaRow: { marginTop: 12, gap: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: colors.mutedForeground },
  line: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13, paddingHorizontal: 16 },
  lineDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  lineTitle: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  lineMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  lineAmount: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  hint: { fontSize: 12, color: colors.mutedForeground, marginLeft: 4, marginBottom: 12 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  sumLabel: { fontSize: 14, color: colors.mutedForeground },
  sumValue: { fontSize: 14, color: colors.foreground },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  totalValue: { fontSize: 16, fontWeight: "800", color: colors.foreground },
  secondaryActions: { flexDirection: "row", gap: 10 },
});
