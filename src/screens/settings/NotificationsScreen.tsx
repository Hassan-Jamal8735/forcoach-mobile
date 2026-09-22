import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, View } from "react-native";
import {
  getNotificationsEnabled,
  requestNotificationPermission,
  scheduleClassReminders,
  setNotificationsEnabled,
} from "../../lib/notifications";
import { listEvents } from "../../lib/api/events";
import { colors } from "../../theme/colors";

export function NotificationsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getNotificationsEnabled().then((v) => {
      setEnabled(v);
      setLoading(false);
    });
  }, []);

  async function handleToggle(next: boolean) {
    setBusy(true);
    try {
      if (next) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            "Notifications disabled",
            "Enable notifications for FORCOACH in your phone's Settings app to use this.",
          );
          setBusy(false);
          return;
        }
      }
      await setNotificationsEnabled(next);
      setEnabled(next);
      if (next) {
        const events = await listEvents();
        await scheduleClassReminders(events);
      }
    } finally {
      setBusy(false);
    }
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
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Upcoming class reminders</Text>
          <Text style={styles.hint}>Get notified 30 minutes before your next class starts.</Text>
        </View>
        {busy ? (
          <ActivityIndicator color={colors.accent} size="small" />
        ) : (
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
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
});
