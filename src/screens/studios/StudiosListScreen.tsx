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
import type { StudiosStackParamList } from "../../navigation/studios-types";
import { Ionicons } from "@expo/vector-icons";
import { listStudios, type Studio } from "../../lib/api/studios";
import { colors, cardShadow, studioColor } from "../../theme/colors";

type Props = NativeStackScreenProps<StudiosStackParamList, "StudiosList">;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

function rateLabel(studio: Studio) {
  if (studio.compensation_type === "tiered") return "Tiered rate";
  if (studio.compensation_value == null) return "No rate set";
  const suffix = studio.compensation_type === "hourly" ? "/hr" : "/class";
  return `€${studio.compensation_value}${suffix}`;
}

export function StudiosListScreen({ navigation }: Props) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setStudios(await listStudios());
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
        <Text style={styles.title}>Studios</Text>
      </View>
      <FlatList
        data={studios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={studios.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No studios yet</Text>
            <Text style={styles.emptySubtitle}>Add the studios you teach at.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("StudioForm", { studio: item })}
          >
            <View style={[styles.avatar, { backgroundColor: studioColor(item.id) }]}>
              <Text style={styles.avatarText}>{initials(item.name)}</Text>
            </View>
            <View style={styles.cardMiddle}>
              <Text style={styles.studioName}>{item.name}</Text>
              <Text style={styles.rate}>{rateLabel(item)}</Text>
            </View>
            {item.status === "inactive" && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("StudioForm", { studio: undefined })}
      >
        <Ionicons name="add-circle" size={18} color={colors.offWhite} />
        <Text style={styles.addBtnText}>Add studio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  listContent: { paddingHorizontal: 20, paddingBottom: 90 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: colors.mutedForeground },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...cardShadow,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  cardMiddle: { flex: 1 },
  studioName: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  rate: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  inactiveBadge: { backgroundColor: colors.secondary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  inactiveText: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600" },
  addBtn: {
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
  addBtnText: { color: colors.offWhite, fontSize: 15, fontWeight: "600" },
});
