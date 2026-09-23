import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getEarningsSummary,
  getEarningsTimeseries,
  type EarningsSummary,
  type TimeseriesPoint,
} from "../lib/api/earnings";
import { useCurrency } from "../lib/currency";
import { Avatar, Banner, Card, EmptyState, Loading, Screen, ScreenHeader, SectionLabel, Segmented, initials } from "../components/ui";
import { colors, studioColor } from "../theme/colors";

type Period = "week" | "month" | "year";

function range(period: Period) {
  const now = new Date();
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  if (period === "month") start.setDate(1);
  if (period === "year") start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return { from: start.toISOString(), to: now.toISOString() };
}

const GRANULARITY: Record<Period, "day" | "week" | "month"> = { week: "day", month: "week", year: "month" };

function bucketLabel(bucket: string, period: Period) {
  if (period === "year") return new Date(`${bucket}-01T00:00:00`).toLocaleDateString(undefined, { month: "short" });
  const d = new Date(`${bucket}T00:00:00`);
  return period === "week" ? d.toLocaleDateString(undefined, { weekday: "short" }) : `${d.getDate()}/${d.getMonth() + 1}`;
}

export function EarningsScreen() {
  const { format } = useCurrency();
  const [period, setPeriod] = useState<Period>("month");
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period) => {
    try {
      setError(null);
      const { from, to } = range(p);
      const [s, t] = await Promise.all([getEarningsSummary(from, to), getEarningsTimeseries(from, to, GRANULARITY[p])]);
      setSummary(s);
      setPoints(t.points);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load earnings");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(period);
    }, [load, period]),
  );

  if (!summary && !error) return <Loading />;

  const max = Math.max(1, ...points.map((p) => p.earnings));
  const top = Math.max(1, ...(summary?.studioBreakdown ?? []).map((s) => s.earnings));
  const periodLabel = { week: "this week", month: "this month", year: "this year" }[period];

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(period);
      }}
    >
      <ScreenHeader title="Earnings" />
      <Segmented
        options={[
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "year", label: "Year" },
        ]}
        value={period}
        onChange={setPeriod}
      />

      {error && <View style={{ marginTop: 12 }}><Banner message={error} /></View>}

      <Card style={styles.hero}>
        <Text style={styles.heroLabel}>Earned {periodLabel}</Text>
        <Text style={styles.heroAmount}>{format(summary?.totalEarnings ?? 0, 0)}</Text>

        {points.length > 0 ? (
          <View style={styles.chart}>
            {points.map((p) => {
              const isMax = p.earnings === max && max > 1;
              return (
                <View key={p.bucket} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${Math.max(4, (p.earnings / max) * 100)}%` }, isMax && styles.barMax]} />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {bucketLabel(p.bucket, period)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noData}>No paid classes yet {periodLabel}.</Text>
        )}
      </Card>

      <View style={styles.stats}>
        <Stat label="Classes" value={String(summary?.classCount ?? 0)} />
        <Stat label="Hours" value={String(Number((summary?.totalHours ?? 0).toFixed(1)))} />
        <Stat label="Avg / class" value={format(summary?.avgClassRate ?? 0, 0)} />
      </View>

      {!!summary?.pendingCount && (
        <Banner
          tone="info"
          message={`${summary.pendingCount} class${summary.pendingCount === 1 ? " isn't" : "es aren't"} assigned to a studio yet, so ${summary.pendingCount === 1 ? "it's" : "they're"} not counted.`}
        />
      )}
      {!!summary?.pendingAttendanceCount && (
        <Banner
          tone="info"
          message={`${summary.pendingAttendanceCount} tiered class${summary.pendingAttendanceCount === 1 ? " needs" : "es need"} attendance before ${summary.pendingAttendanceCount === 1 ? "it" : "they"} can be priced.`}
        />
      )}

      <SectionLabel>Breakdown by studio</SectionLabel>
      {(summary?.studioBreakdown ?? []).length === 0 ? (
        <Card>
          <EmptyState icon="stats-chart-outline" title="Nothing to show yet" subtitle="Earnings appear once classes are assigned to a studio." />
        </Card>
      ) : (
        <Card>
          {summary?.studioBreakdown.map((s, i) => (
            <View key={s.studioId} style={[styles.studio, i > 0 && styles.studioDivider]}>
              <View style={styles.studioTop}>
                <Avatar label={initials(s.studioName)} color={studioColor(s.studioId)} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studioName}>{s.studioName}</Text>
                  <Text style={styles.studioMeta}>
                    {s.classCount} class{s.classCount === 1 ? "" : "es"} · {Number(s.hours.toFixed(1))}h
                  </Text>
                </View>
                <Text style={styles.studioAmount}>{format(s.earnings, 0)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progress, { width: `${(s.earnings / top) * 100}%`, backgroundColor: studioColor(s.studioId) }]} />
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, paddingBottom: 12 },
  heroLabel: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  heroAmount: { fontSize: 40, fontWeight: "800", color: colors.foreground, letterSpacing: -1, marginTop: 2 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 140, gap: 6, marginTop: 16 },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", backgroundColor: colors.accentLight, borderRadius: 8 },
  barMax: { backgroundColor: colors.accent },
  barLabel: { fontSize: 10, color: colors.mutedForeground, marginTop: 6 },
  noData: { fontSize: 13, color: colors.mutedForeground, marginTop: 12 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6 },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.foreground },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  studio: { paddingVertical: 10 },
  studioDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  studioTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  studioName: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  studioMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
  studioAmount: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.secondary, marginTop: 10, overflow: "hidden" },
  progress: { height: "100%", borderRadius: 3 },
});
