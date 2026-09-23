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
import { Badge, Banner, EmptyState, Fab, IconButton, Loading, ScreenHeader } from "../components/ui";
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

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("EventForm", { event: item })}
            >
              <View style={styles.timeCol}>
                <Text style={styles.timeStart}>{time(item.start_time)}</Text>
                <Text style={styles.timeEnd}>{time(item.end_time)}</Text>
              </View>
              <View style={[styles.bar, { backgroundColor: studioColor(item.studio_id) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                {studio ? (
                  <Text style={styles.studio} numberOfLines={1}>
                    {studio}
                  </Text>
                ) : (
                  <View style={{ marginTop: 4, alignSelf: "flex-start" }}>
                    <Badge label="Unassigned" tone="danger" />
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
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
  timeCol: { width: 50 },
  timeStart: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  timeEnd: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  bar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  title: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  studio: { fontSize: 13, color: colors.mutedForeground, marginTop: 3 },
});
