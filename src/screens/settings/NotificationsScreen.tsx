import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Switch, Text } from "react-native";
import {
  getNotificationsEnabled,
  requestNotificationPermission,
  scheduleClassReminders,
  setNotificationsEnabled,
} from "../../lib/notifications";
import { listEvents } from "../../lib/api/events";
import { Card, ListRow, Loading, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

export function NotificationsScreen() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getNotificationsEnabled().then(setEnabled);
  }, []);

  async function toggle(next: boolean) {
    setBusy(true);
    try {
      if (next && !(await requestNotificationPermission())) {
        Alert.alert(
          "Notifications are off",
          "Allow notifications for FORCOACH in your phone's Settings app to use reminders.",
        );
        return;
      }
      await setNotificationsEnabled(next);
      setEnabled(next);
      if (next) await scheduleClassReminders(await listEvents());
    } finally {
      setBusy(false);
    }
  }

  if (enabled === null) return <Loading />;

  return (
    <StackScreen>
      <Card padded={false}>
        <ListRow
          icon="alarm-outline"
          label="Class reminders"
          last
          right={
            busy ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Switch value={enabled} onValueChange={toggle} trackColor={{ true: colors.accent, false: colors.border }} />
            )
          }
        />
      </Card>
      <Text style={{ fontSize: 13, color: colors.mutedForeground, marginLeft: 4 }}>
        Get a reminder 30 minutes before each class you've assigned to a studio.
      </Text>
    </StackScreen>
  );
}
