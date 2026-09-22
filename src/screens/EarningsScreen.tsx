import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getEarningsSummary, getEarningsTimeseries, type EarningsSummary, type TimeseriesPoint } from "../lib/api/earnings";
import { colors, studioColor } from "../theme/colors";

type Period = "week" | "month" | "year";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

function rangeFor(period: Period) {
  const now = new Date();
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - 7);
  if (period === "month") start.setMonth(now.getMonth() - 1);
  if (period === "year") start.setFullYear(now.getFullYear() - 1);
  return { from: start.toISOString(), to: now.toISOString() };
}

export function EarningsScreen() {
  const [period, setPeriod] = useState<Period>("month");
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period) => {
    try {
      setError(null);
      const { from, to } = rangeFor(p);
      const [summaryData, timeseriesData] = await Promise.all([
        getEarningsSummary(from, to),
        getEarningsTimeseries(from, to, "week"),
      ]);
      setSummary(summaryData);
      setPoints(timeseriesData.points);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load earnings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load(period);
    }, [load, period]),
  );

  const maxEarnings = Math.max(1, ...points.map((p) => p.earnings));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(period);
          }}
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Earnings</Text>
        <View style={styles.periodRow}>
          {(["week", "month", "year"] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.total}>€{(summary?.totalEarnings ?? 0).toFixed(0)}</Text>
      <Text style={styles.totalSubtitle}>
        {summary?.classCount ?? 0} class{summary?.classCount === 1 ? "" : "es"}
        {summary?.bestStudio ? ` · Best: ${summary.bestStudio}` : ""}
      </Text>

      {points.length > 0 && (
        <View style={styles.chart}>
          {points.map((p) => (
            <View key={p.bucket} style={styles.chartBarWrap}>
              <View
                style={[
                  styles.chartBar,
                  { height: Math.max(4, (p.earnings / maxEarnings) * 100) },
                ]}
              />
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>Breakdown by studio</Text>
      {(summary?.studioBreakdown ?? []).length === 0 ? (
        <Text style={styles.empty}>No earnings yet for this period.</Text>
      ) : (
        summary?.studioBreakdown.map((s) => (
          <View key={s.studioId} style={styles.studioRow}>
            <View style={[styles.avatar, { backgroundColor: studioColor(s.studioId) }]}>
              <Text style={styles.avatarText}>{initials(s.studioName)}</Text>
            </View>
            <Text style={styles.studioName}>{s.studioName}</Text>
            <Text style={styles.studioAmount}>€{s.earnings.toFixed(0)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 12 },
  periodRow: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 10, padding: 4, gap: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  periodBtnActive: { backgroundColor: colors.card },
  periodText: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
  periodTextActive: { color: colors.foreground },
  error: { color: colors.destructiveText, fontSize: 13, marginBottom: 12 },
  total: { fontSize: 40, fontWeight: "700", color: colors.foreground },
  totalSubtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, marginBottom: 24 },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 110,
    marginBottom: 28,
    gap: 8,
  },
  chartBarWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: 100 },
  chartBar: { width: "100%", backgroundColor: colors.accent, borderRadius: 6, minHeight: 4 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, marginBottom: 10 },
  empty: { fontSize: 14, color: colors.mutedForeground },
  studioRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  studioName: { flex: 1, fontSize: 15, color: colors.foreground },
  studioAmount: { fontSize: 15, fontWeight: "600", color: colors.foreground },
});
