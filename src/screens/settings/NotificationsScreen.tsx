import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function NotificationsScreen() {
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Upcoming class reminders</Text>
          <Text style={styles.hint}>Get notified before your next class starts.</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>
      <Text style={styles.note}>
        Push notifications are coming in a future update — this toggle doesn't send anything yet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  rowText: { flex: 1, marginRight: 12 },
  label: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  hint: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
  note: { fontSize: 12, color: colors.mutedForeground, marginTop: 16 },
});
