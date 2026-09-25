import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  deleteIcsFeed,
  disconnectGoogleCalendar,
  getGoogleConnectUrl,
  getGoogleStatus,
  listGoogleCalendars,
  listIcsFeeds,
  selectGoogleCalendar,
  syncGoogleCalendar,
  syncIcsFeed,
  type GoogleCalendarOption,
  type GoogleCalendarStatus,
  type IcsFeed,
} from "../../lib/api/sync";
import { listStudios, type Studio } from "../../lib/api/studios";
import { runReturnFlow } from "../../lib/return-flow";
import { Banner, Button, Card, ListRow, Loading, SectionLabel, StackScreen } from "../../components/ui";
import { SelectSheet } from "../../components/Pickers";
import { ConnectFeedSheet, PLATFORMS, PlatformBadge, type PlatformKey } from "../../components/ConnectFeedSheet";
import { colors } from "../../theme/colors";

function ago(iso: string | null) {
  if (!iso) return "Never synced";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Synced just now";
  if (mins < 60) return `Synced ${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Synced ${hrs}h ago`;
  return `Synced ${Math.round(hrs / 24)}d ago`;
}

export function CalendarSyncScreen() {
  const [google, setGoogle] = useState<GoogleCalendarStatus | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>([]);
  const [feeds, setFeeds] = useState<IcsFeed[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; msg: string } | null>(null);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);

  const load = useCallback(async () => {
    try {
      const [g, f, s] = await Promise.all([getGoogleStatus(), listIcsFeeds(), listStudios()]);
      setGoogle(g);
      setFeeds(f);
      setStudios(s);
      if (g.connected) listGoogleCalendars().then(setCalendars).catch(() => {});
    } catch (e) {
      setNotice({ tone: "danger", msg: e instanceof Error ? e.message : "Could not load your connections" });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function run(key: string, fn: () => Promise<string | void>) {
    setBusy(key);
    setNotice(null);
    try {
      const msg = await fn();
      if (msg) setNotice({ tone: "success", msg });
      await load();
    } catch (e) {
      setNotice({ tone: "danger", msg: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setBusy(null);
    }
  }

  const connectGoogle = () =>
    run("google-connect", async () => {
      const result = await runReturnFlow((returnTo) => getGoogleConnectUrl(returnTo));
      if (!result) return;
      if (result.google !== "connected") throw new Error("Google Calendar couldn't be connected. Please try again.");
      return "Google Calendar connected. Now choose which calendar to import.";
    });

  const disconnectGoogle = () =>
    Alert.alert("Disconnect Google Calendar?", "Classes already imported stay in your schedule.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => run("google-disconnect", async () => {
        await disconnectGoogleCalendar();
        return "Google Calendar disconnected.";
      }) },
    ]);

  const removeFeed = (feed: IcsFeed) =>
    Alert.alert(`Remove ${feed.name}?`, "Classes already imported stay in your schedule.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => run(`del-${feed.id}`, async () => {
        await deleteIcsFeed(feed.id);
        return `${feed.name} removed.`;
      }) },
    ]);

  if (!google) return notice ? <StackScreen><Banner message={notice.msg} /></StackScreen> : <Loading />;

  return (
    <StackScreen>
      {notice && <Banner tone={notice.tone} message={notice.msg} />}

      <SectionLabel>Google Calendar</SectionLabel>
      <Card>
        <View style={styles.googleHead}>
          <View style={styles.googleIcon}>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Google Calendar</Text>
            <Text style={styles.cardMeta}>
              {google.connected ? google.googleAccountEmail ?? "Connected" : "Import classes from your Google Calendar"}
            </Text>
          </View>
        </View>

        {google.connected ? (
          <>
            {calendars.length > 0 && (
              <SelectSheet
                label="Calendar to import"
                value={google.calendarId}
                placeholder="Choose a calendar"
                options={calendars.map((c) => ({ value: c.id, label: c.name, subtitle: c.primary ? "Primary" : undefined }))}
                onChange={(id) =>
                  run("google-select", async () => {
                    const cal = calendars.find((c) => c.id === id);
                    await selectGoogleCalendar(id, cal?.name ?? id);
                    return "Calendar selected.";
                  })
                }
              />
            )}
            <Text style={styles.cardMeta}>{ago(google.lastSyncedAt)}</Text>
            <View style={styles.actions}>
              <Button
                title="Sync now"
                icon="sync"
                style={{ flex: 1 }}
                loading={busy === "google-sync"}
                disabled={!google.calendarId}
                onPress={() =>
                  run("google-sync", async () => {
                    const r = await syncGoogleCalendar();
                    return `Synced: ${r.created} new, ${r.updated} updated.`;
                  })
                }
              />
              <Button title="Disconnect" variant="secondary" style={{ flex: 1 }} loading={busy === "google-disconnect"} onPress={disconnectGoogle} />
            </View>
          </>
        ) : (
          <Button title="Connect Google Calendar" onPress={connectGoogle} loading={busy === "google-connect"} style={{ marginTop: 14 }} />
        )}
      </Card>

      <SectionLabel>Studio platforms</SectionLabel>
      <Card padded={false}>
        {PLATFORMS.map((p, i) => (
          <ListRow
            key={p.key}
            left={<PlatformBadge platform={p} size={34} />}
            label={p.label}
            onPress={() => setConnecting(p.key)}
            last={i === PLATFORMS.length - 1}
            right={<Text style={styles.connect}>Connect</Text>}
          />
        ))}
      </Card>

      {feeds.length > 0 && (
        <>
          <SectionLabel>Connected calendars</SectionLabel>
          <Card padded={false}>
            {feeds.map((f, i) => (
              <ListRow
                key={f.id}
                icon="calendar-outline"
                label={`${f.name} · ${ago(f.last_synced_at)}`}
                last={i === feeds.length - 1}
                right={
                  busy === `sync-${f.id}` || busy === `del-${f.id}` ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <Ionicons
                        name="sync"
                        size={20}
                        color={colors.accent}
                        onPress={() =>
                          run(`sync-${f.id}`, async () => {
                            const r = await syncIcsFeed(f.id);
                            return `${f.name} synced: ${r.created} new, ${r.updated} updated.`;
                          })
                        }
                      />
                      <Ionicons name="trash-outline" size={20} color={colors.destructive} onPress={() => removeFeed(f)} />
                    </View>
                  )
                }
              />
            ))}
          </Card>
        </>
      )}

      <ConnectFeedSheet
        platformKey={connecting}
        studios={studios}
        onClose={() => setConnecting(null)}
        onConnected={(r) => {
          setConnecting(null);
          setNotice({ tone: "success", msg: `Connected. ${r.created} classes imported.` });
          load();
        }}
      />
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  googleHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  googleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  cardMeta: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  connect: { fontSize: 14, fontWeight: "700", color: colors.accent },
});
