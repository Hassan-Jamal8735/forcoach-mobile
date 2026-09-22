import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Event } from "./api/events";

const PREF_KEY = "forcoach:notifications_enabled";
const REMINDER_MINUTES_BEFORE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationsEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(PREF_KEY)) === "1";
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, enabled ? "1" : "0");
  if (!enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Local, on-device reminders — no push server needed since these are
// scheduled entirely from the coach's own upcoming classes.
export async function scheduleClassReminders(events: Event[]): Promise<void> {
  const enabled = await getNotificationsEnabled();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const now = Date.now();
  const upcoming = events.filter(
    (e) => e.status === "assigned" && new Date(e.start_time).getTime() > now,
  );

  for (const event of upcoming) {
    const triggerAt = new Date(event.start_time).getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000;
    if (triggerAt <= now) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming class",
        body: `${event.title} starts in ${REMINDER_MINUTES_BEFORE} minutes`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(triggerAt) },
    });
  }
}
