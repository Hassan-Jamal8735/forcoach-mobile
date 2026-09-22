import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingHeader } from "../../components/OnboardingHeader";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ConnectPlatforms">;

const PLATFORMS = [
  { key: "mindbody", label: "Mindbody", initials: "MB", color: "#0f172a" },
  { key: "bsport", label: "Bsport", initials: "BS", color: "#0ea5e9" },
  { key: "momence", label: "Momence", initials: "MO", color: "#7c3aed" },
  { key: "google_calendar", label: "Google Calendar", initials: "GC", color: "#16a34a" },
];

export function ConnectPlatformsScreen({ navigation }: Props) {
  function handleConnect(label: string) {
    Alert.alert(
      `Connect ${label}`,
      "This integration is coming soon. You'll be able to sync your schedule automatically once it's ready.",
    );
  }

  return (
    <View style={styles.container}>
      <OnboardingHeader step={2} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Connect your platforms</Text>
        <Text style={styles.subtitle}>
          Sync your schedule automatically by connecting your studio platforms.
        </Text>

        {PLATFORMS.map((p) => (
          <View key={p.key} style={styles.row}>
            <View style={[styles.badge, { backgroundColor: p.color }]}>
              <Text style={styles.badgeText}>{p.initials}</Text>
            </View>
            <Text style={styles.label}>{p.label}</Text>
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={() => handleConnect(p.label)}
            >
              <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => navigation.navigate("SetRates")}
      >
        <Text style={styles.nextBtnText}>I'll do this later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  label: { flex: 1, fontSize: 15, color: colors.foreground, fontWeight: "500" },
  connectBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  connectText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  nextBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  nextBtnText: { color: colors.foreground, fontSize: 16, fontWeight: "600" },
});
