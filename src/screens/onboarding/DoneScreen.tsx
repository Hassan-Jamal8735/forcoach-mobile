import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../context/OnboardingContext";
import { supabase } from "../../lib/supabase";
import { listEvents } from "../../lib/api/events";
import { requestNotificationPermission, scheduleClassReminders, setNotificationsEnabled } from "../../lib/notifications";
import { Button, Card } from "../../components/ui";
import { colors } from "../../theme/colors";

export function DoneScreen() {
  const { currency } = useOnboarding();
  const [finishing, setFinishing] = useState(false);
  const [notifState, setNotifState] = useState<"ask" | "busy" | "on" | "skipped">("ask");

  async function enableNotifications() {
    setNotifState("busy");
    const granted = await requestNotificationPermission().catch(() => false);
    await setNotificationsEnabled(granted);
    if (granted) listEvents().then(scheduleClassReminders).catch(() => {});
    setNotifState(granted ? "on" : "skipped");
  }

  async function finish() {
    setFinishing(true);
    // Flipping this flag makes RootNavigator swap straight into the app.
    await supabase.auth.updateUser({ data: { currency, mobile_onboarding_completed: true } });
    setFinishing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.center}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={44} color={colors.accent} />
        </View>
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>Your account is ready. Let's get to your schedule.</Text>
      </View>

      <View style={styles.bottom}>
        {notifState !== "on" && notifState !== "skipped" ? (
          <Card style={styles.notify}>
            <View style={styles.notifyIcon}>
              <Ionicons name="notifications" size={22} color={colors.accent} />
            </View>
            <Text style={styles.notifyTitle}>Never miss a class</Text>
            <Text style={styles.notifyText}>Get a reminder 30 minutes before each of your classes.</Text>
            <Button title="Enable notifications" onPress={enableNotifications} loading={notifState === "busy"} style={{ alignSelf: "stretch" }} />
            <Button title="Maybe later" variant="ghost" onPress={() => setNotifState("skipped")} style={{ alignSelf: "stretch" }} />
          </Card>
        ) : null}
        <Button title="Go to my schedule" icon="arrow-forward" variant="dark" onPress={finish} loading={finishing} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 30, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.mutedForeground, textAlign: "center", marginTop: 8 },
  bottom: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  notify: { alignItems: "center", gap: 6 },
  notifyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  notifyTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground },
  notifyText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginBottom: 8 },
});
