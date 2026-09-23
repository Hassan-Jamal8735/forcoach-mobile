import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "../../navigation/invoices-types";
import { Ionicons } from "@expo/vector-icons";
import { listInvoices, type Invoice, type InvoiceStatus } from "../../lib/api/invoices";
import { colors, cardShadow } from "../../theme/colors";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoicesList">;

type Filter = "all" | "draft" | "generated";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusBadge(status: InvoiceStatus) {
  if (status === "draft") return { label: "Draft", bg: colors.secondary, text: colors.mutedForeground };
  if (status === "generated") return { label: "Generated", bg: colors.successMuted, text: colors.successText };
  return { label: "Archived", bg: colors.secondary, text: colors.mutedForeground };
}

export function InvoicesListScreen({ navigation }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = invoices.filter((inv) => filter === "all" || inv.status === filter);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <View style={styles.tabRow}>
          {(["all", "draft", "generated"] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.tab, filter === f && styles.tabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
                {f === "all" ? "All" : f === "draft" ? "Drafts" : "Generated"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No invoices yet</Text>
            <Text style={styles.emptySubtitle}>Create your first invoice below.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const badge = statusBadge(item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: item.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.invoiceNumber}>{item.invoice_number ?? "Draft"}</Text>
                <Text style={styles.amount}>€{item.total.toFixed(0)}</Text>
              </View>
              <Text style={styles.studioName}>{item.studio_name}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.date}>{formatDate(item.period_start)} – {formatDate(item.period_end)}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate("CreateInvoice")}>
        <Ionicons name="add-circle" size={18} color={colors.offWhite} />
        <Text style={styles.createBtnText}>Create invoice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 12 },
  tabRow: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
  tabTextActive: { color: colors.foreground },
  errorBanner: { backgroundColor: colors.destructiveMuted, marginHorizontal: 20, borderRadius: 8, padding: 10, marginBottom: 8 },
  errorText: { color: colors.destructiveText, fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 90 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: colors.mutedForeground },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...cardShadow,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  invoiceNumber: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  amount: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  studioName: { fontSize: 13, color: colors.mutedForeground, marginBottom: 8 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 12, color: colors.mutedForeground },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  createBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  createBtnText: { color: colors.offWhite, fontSize: 15, fontWeight: "600" },
});
