import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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

/** The period `offset` steps back from the current one (0 = this week/month/year). */
function range(period: Period, offset: number) {
  const now = new Date();
  let start: Date;
  let end: Date;
  if (period === "week") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - offset * 7);
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  } else {
    start = new Date(now.getFullYear() - offset, 0, 1);
    end = new Date(start.getFullYear() + 1, 0, 1);
  }
  // The current period stops at "now" so upcoming classes aren't counted as earned yet.
  const to = offset === 0 ? now : new Date(end.getTime() - 1);
  return { start, from: start.toISOString(), to: to.toISOString() };
}

function rangeLabel(period: Period, offset: number) {
  if (offset === 0) return { week: "this week", month: "this month", year: "this year" }[period];
  const { start } = range(period, offset);
  if (period === "year") return `in ${start.getFullYear()}`;
  if (period === "month") return `in ${start.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const day = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return `${day(start)} – ${day(last)}`;
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
  const [offset, setOffset] = useState(0);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period, o: number) => {
    try {
      setError(null);
      const { from, to } = range(p, o);
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
      load(period, offset);
    }, [load, period, offset]),
  );

  if (!summary && !error) return <Loading />;

  const max = Math.max(1, ...points.map((p) => p.earnings));
  const top = Math.max(1, ...(summary?.studioBreakdown ?? []).map((s) => s.earnings));
  const periodLabel = rangeLabel(period, offset);
  const navLabel = periodLabel.replace(/^in /, "");

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(period, offset);
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
        onChange={(p) => {
          setPeriod(p);
          setOffset(0);
        }}
      />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => setOffset((o) => o + 1)} hitSlop={10} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.navLabel}>{navLabel.charAt(0).toUpperCase() + navLabel.slice(1)}</Text>
        <TouchableOpacity
          onPress={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          hitSlop={10}
          style={[styles.navButton, offset === 0 && { opacity: 0.3 }]}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

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
          <Text style={styles.noData}>{offset === 0 ? `No paid classes yet ${periodLabel}.` : `No paid classes ${periodLabel}.`}</Text>
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
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  navButton: { padding: 6 },
  navLabel: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  hero: { marginTop: 10, paddingBottom: 12 },
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
