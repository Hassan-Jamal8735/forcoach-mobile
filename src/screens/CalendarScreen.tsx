import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CalendarStackParamList } from "../navigation/types";
import { listEvents, type Event } from "../lib/api/events";
import { listStudios, type Studio } from "../lib/api/studios";
import { scheduleClassReminders } from "../lib/notifications";
import { Banner, EmptyState, Fab, IconButton, Loading, ScreenHeader } from "../components/ui";
import { colors, cardShadow, studioColor } from "../theme/colors";

type Props = NativeStackScreenProps<CalendarStackParamList, "CalendarList">;

const DAY_LETTERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Splits "9:00 AM" into "9:00" + "AM" so the period can be set smaller;
// 24-hour locales ("09:00") simply have no suffix.
function timeParts(iso: string) {
  const [main, ...rest] = new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).split(/\s/);
  return { main, suffix: rest.join(" ") };
}

function duration(startIso: string, endIso: string) {
  const mins = Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
}

export function CalendarScreen({ navigation }: Props) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [selected, setSelected] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [e, s] = await Promise.all([listEvents(), listStudios()]);
      setEvents(e);
      setStudios(s);
      scheduleClassReminders(e).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your schedule");
      setEvents((prev) => prev ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const week = useMemo(() => {
    const start = startOfWeek(selected);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selected]);

  const dayEvents = useMemo(
    () =>
      (events ?? [])
        .filter((e) => e.status !== "excluded" && sameDay(new Date(e.start_time), selected))
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [events, selected],
  );

  const daysWithClasses = useMemo(() => {
    const set = new Set<string>();
    (events ?? []).forEach((e) => e.status !== "excluded" && set.add(new Date(e.start_time).toDateString()));
    return set;
  }, [events]);

  const hours = dayEvents.reduce((sum, e) => sum + (Date.parse(e.end_time) - Date.parse(e.start_time)) / 3_600_000, 0);
  const studioName = (id: string | null) => studios.find((s) => s.id === id)?.name;

  function shiftWeek(delta: number) {
    const d = new Date(selected);
    d.setDate(d.getDate() + delta * 7);
    setSelected(d);
  }

  if (!events) return <Loading />;

  const isToday = sameDay(selected, new Date());

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.pad}>
        <ScreenHeader
          title="Schedule"
          subtitle={selected.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          right={!isToday ? <IconButton icon="today-outline" onPress={() => setSelected(new Date())} /> : undefined}
        />
      </View>

      <View style={styles.weekRow}>
        <TouchableOpacity onPress={() => shiftWeek(-1)} hitSlop={10} style={styles.arrow}>
          <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        {week.map((d, i) => {
          const active = sameDay(d, selected);
          const today = sameDay(d, new Date());
          return (
            <TouchableOpacity key={d.toISOString()} style={[styles.day, active && styles.dayActive]} onPress={() => setSelected(d)}>
              <Text style={[styles.dayLetter, active && styles.dayTextActive]}>{DAY_LETTERS[i]}</Text>
              <Text style={[styles.dayNum, active && styles.dayTextActive, today && !active && { color: colors.accent }]}>
                {d.getDate()}
              </Text>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: daysWithClasses.has(d.toDateString()) ? (active ? colors.accentForeground : colors.accent) : "transparent" },
                ]}
              />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={() => shiftWeek(1)} hitSlop={10} style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.pad, styles.summary]}>
        <Text style={styles.summaryTitle}>
          {selected.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </Text>
        <Text style={styles.summaryMeta}>
          {dayEvents.length} class{dayEvents.length === 1 ? "" : "es"} · {Number(hours.toFixed(1))}h
        </Text>
      </View>

      <FlatList
        data={dayEvents}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={error ? <Banner message={error} /> : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState icon="calendar-clear-outline" title="No classes this day" subtitle="Tap + to add a class, or connect your studio calendar in Settings." />
        }
        renderItem={({ item }) => {
          const studio = studioName(item.studio_id);
          const color = studioColor(item.studio_id);
          const start = timeParts(item.start_time);
          const end = timeParts(item.end_time);
          const past = Date.parse(item.end_time) < Date.now();
          return (
            <View style={styles.row}>
              <View style={styles.timeCol}>
                <Text style={styles.timeMain}>
                  {start.main}
                  {start.suffix ? <Text style={styles.timeSuffix}> {start.suffix}</Text> : null}
                </Text>
                <Text style={styles.timeEnd}>
                  {end.main}
                  {end.suffix ? ` ${end.suffix}` : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: `${color}14`, borderLeftColor: color }, past && styles.cardPast]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EventForm", { event: item })}
              >
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.studioRow}>
                  <Ionicons name={studio ? "location-outline" : "alert-circle-outline"} size={13} color={studio ? colors.mutedForeground : colors.destructive} />
                  <Text style={[styles.studio, !studio && { color: colors.destructive }]} numberOfLines={1}>
                    {studio ?? "No studio assigned"}
                  </Text>
                </View>
                <View style={styles.chips}>
                  <View style={styles.chip}>
                    <Ionicons name="time-outline" size={12} color={color} />
                    <Text style={[styles.chipText, { color }]}>{duration(item.start_time, item.end_time)}</Text>
                  </View>
                  {item.rate_override != null && (
                    <View style={styles.chip}>
                      <Ionicons name="pricetag-outline" size={12} color={color} />
                      <Text style={[styles.chipText, { color }]}>Custom rate</Text>
                    </View>
                  )}
                  {past && (
                    <View style={styles.chip}>
                      <Ionicons name="checkmark-done" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.chipText, { color: colors.mutedForeground }]}>Done</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Fab onPress={() => navigation.navigate("EventForm", { date: selected.toISOString() })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pad: { paddingHorizontal: 20 },
  weekRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, marginBottom: 8 },
  arrow: { paddingHorizontal: 4, paddingVertical: 12 },
  day: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 16, gap: 3 },
  dayActive: { backgroundColor: colors.accent, ...cardShadow },
  dayLetter: { fontSize: 11, fontWeight: "600", color: colors.mutedForeground },
  dayNum: { fontSize: 17, fontWeight: "700", color: colors.foreground },
  dayTextActive: { color: colors.accentForeground },
  dot: { width: 5, height: 5, borderRadius: 3 },
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingVertical: 10 },
  summaryTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground },
  summaryMeta: { fontSize: 13, color: colors.mutedForeground },
  list: { paddingHorizontal: 20, paddingBottom: 110, flexGrow: 1 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  timeCol: { width: 70, paddingTop: 12, alignItems: "flex-end" },
  timeMain: { fontSize: 15, fontWeight: "800", color: colors.foreground },
  timeSuffix: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground },
  timeEnd: { fontSize: 12, color: colors.mutedForeground, marginTop: 3 },
  card: {
    flex: 1,
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  cardPast: { opacity: 0.6 },
  title: { fontSize: 16, fontWeight: "800", color: colors.foreground },
  studioRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  studio: { fontSize: 13, color: colors.mutedForeground, flexShrink: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: "700" },
});
