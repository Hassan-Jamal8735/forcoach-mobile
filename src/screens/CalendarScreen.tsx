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
import type { CalendarStackParamList } from "../navigation/types";
import { listEvents, type Event } from "../lib/api/events";
import { listStudios, type Studio } from "../lib/api/studios";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<CalendarStackParamList, "CalendarList">;

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(startISO: string, endISO: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startISO).toLocaleTimeString(undefined, opts)} – ${new Date(endISO).toLocaleTimeString(undefined, opts)}`;
}

export function CalendarScreen({ navigation }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [eventsData, studiosData] = await Promise.all([listEvents(), listStudios()]);
      const sorted = [...eventsData].sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      );
      setEvents(sorted);
      setStudios(studiosData);
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
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={events.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No classes yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first class.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventForm", { event: item })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardStudio}>{studioName(item.studio_id)}</Text>
            </View>
            <Text style={styles.cardDay}>{formatDay(item.start_time)}</Text>
            <Text style={styles.cardTime}>
              {formatTimeRange(item.start_time, item.end_time)}
            </Text>
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorBanner: {
    backgroundColor: colors.destructiveMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: { color: colors.destructiveText, fontSize: 13 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: colors.foreground },
  emptySubtitle: { fontSize: 13, color: colors.mutedForeground, textAlign: "center" },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 15, fontWeight: "600", flexShrink: 1, color: colors.foreground },
  cardStudio: { fontSize: 12, color: colors.accent, fontWeight: "500" },
  cardDay: { fontSize: 13, color: colors.foreground, marginTop: 6 },
  cardTime: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: { color: colors.accentForeground, fontSize: 28, lineHeight: 30 },
});
