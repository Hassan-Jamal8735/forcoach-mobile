import { useCallback, useMemo, useState } from "react";
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
import type { CalendarStackParamList } from "../navigation/types";
import { listEvents, type Event } from "../lib/api/events";
import { listStudios, type Studio } from "../lib/api/studios";
import { scheduleClassReminders } from "../lib/notifications";
import { colors, studioColor } from "../theme/colors";

type Props = NativeStackScreenProps<CalendarStackParamList, "CalendarList">;

const DAY_LETTERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function CalendarScreen({ navigation }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [eventsData, studiosData] = await Promise.all([listEvents(), listStudios()]);
      setEvents(eventsData);
      setStudios(studiosData);
      scheduleClassReminders(eventsData).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your schedule");
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

  function studioName(id: string | null) {
    if (!id) return "Unassigned";
    return studios.find((s) => s.id === id)?.name ?? "Unassigned";
  }

  const week = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => isSameDay(new Date(e.start_time), selectedDate))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [events, selectedDate],
  );

  const totalHours = dayEvents.reduce(
    (sum, e) => sum + (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / 3600000,
    0,
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.weekStrip}>
        {week.map((d, i) => {
          const selected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, new Date());
          return (
            <TouchableOpacity
              key={d.toISOString()}
              style={styles.dayCol}
              onPress={() => setSelectedDate(d)}
            >
              <Text style={styles.dayLetter}>{DAY_LETTERS[i]}</Text>
              <View style={[styles.dayCircle, selected && styles.dayCircleSelected]}>
                <Text style={[styles.dayNumber, selected && styles.dayNumberSelected, isToday && !selected && styles.dayNumberToday]}>
                  {d.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dateHeader}>
        <Text style={styles.dateTitle}>
          {selectedDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </Text>
        <Text style={styles.dateSubtitle}>
          {dayEvents.length} class{dayEvents.length === 1 ? "" : "es"} · {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
        </Text>
      </View>

      <FlatList
        data={dayEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dayEvents.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No classes this day</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add one.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventForm", { event: item })}
          >
            <View style={styles.cardTime}>
              <Text style={styles.timeText}>{formatTime(item.start_time)}</Text>
              <Text style={styles.timeText}>{formatTime(item.end_time)}</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: studioColor(item.studio_id) }]} />
            <View style={styles.cardMiddle}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardStudio}>{studioName(item.studio_id)}</Text>
            </View>
            <Text style={styles.chevron}>{"›"}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("EventForm", { event: undefined })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorBanner: { backgroundColor: colors.destructiveMuted, paddingHorizontal: 16, paddingVertical: 10 },
  errorText: { color: colors.destructiveText, fontSize: 13 },
  weekStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  dayCol: { alignItems: "center", gap: 6 },
  dayLetter: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600" },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: { backgroundColor: colors.charcoal },
  dayNumber: { fontSize: 14, color: colors.foreground, fontWeight: "600" },
  dayNumberSelected: { color: colors.offWhite },
  dayNumberToday: { color: colors.accent },
  dateHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  dateTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  dateSubtitle: { fontSize: 12, color: colors.mutedForeground },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: colors.foreground },
  emptySubtitle: { fontSize: 13, color: colors.mutedForeground },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  cardTime: { width: 46, alignItems: "flex-start" },
  timeText: { fontSize: 12, color: colors.mutedForeground },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardMiddle: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  cardStudio: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  chevron: { fontSize: 18, color: colors.mutedForeground },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: { color: colors.offWhite, fontSize: 28, lineHeight: 30 },
});
