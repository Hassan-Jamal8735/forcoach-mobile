import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "../../navigation/settings-types";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { colors, cardShadow } from "../../theme/colors";

type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsMenu">;

export function SettingsMenuScreen({ navigation }: Props) {
  const { session, signOut } = useAuth();

  const rows: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { label: "Profile", icon: "person-outline", onPress: () => navigation.navigate("Profile") },
    {
      label: "Studios & integrations",
      icon: "link-outline",
      onPress: () => (navigation.getParent() as { navigate: (name: string) => void } | undefined)?.navigate("Studios"),
    },
    { label: "Payment details", icon: "card-outline", onPress: () => navigation.navigate("PaymentDetails") },
    { label: "Notifications", icon: "notifications-outline", onPress: () => navigation.navigate("Notifications") },
    { label: "Currency", icon: "cash-outline", onPress: () => navigation.navigate("Currency") },
  ];

  function handleLogOut() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.email}>{session?.user.email}</Text>

      <View style={styles.card}>
        {rows.map((row, i) => (
          <TouchableOpacity
            key={row.label}
            style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
            onPress={row.onPress}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={row.icon} size={18} color={colors.accent} />
            </View>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 4 },
  email: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    ...cardShadow,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBorder: { borderBottomWidth: 1, borderColor: colors.border },
  rowLabel: { flex: 1, fontSize: 15, color: colors.foreground },
  logoutBtn: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: colors.destructive, fontSize: 15, fontWeight: "600" },
});
