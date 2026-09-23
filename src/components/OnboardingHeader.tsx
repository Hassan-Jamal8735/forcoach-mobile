import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

const TOTAL_STEPS = 6;

export function OnboardingHeader({
  step,
  onBack,
}: {
  step: number;
  onBack?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
        <Text style={styles.stepLabel}>
          {step}/{TOTAL_STEPS}
        </Text>
      </View>
      <View style={styles.dashRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.dash, i < step && styles.dashActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
  dashRow: { flexDirection: "row", gap: 6, marginTop: 14 },
  dash: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dashActive: { backgroundColor: colors.accent },
});
