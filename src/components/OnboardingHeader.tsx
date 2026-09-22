import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>{"‹"}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
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
  back: { fontSize: 28, color: colors.foreground, lineHeight: 28 },
  stepLabel: { fontSize: 13, color: colors.mutedForeground },
  dashRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  dash: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  dashActive: { backgroundColor: colors.foreground },
});
