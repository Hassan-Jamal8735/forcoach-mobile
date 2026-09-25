import { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createIcsFeed, syncIcsFeed } from "../lib/api/sync";
import type { Studio } from "../lib/api/studios";
import { Banner, Button, Field } from "./ui";
import { SelectSheet } from "./Pickers";
import { colors } from "../theme/colors";

export type PlatformKey = "mindbody" | "bsport" | "momence" | "other";

export const PLATFORMS: {
  key: PlatformKey;
  label: string;
  tagline: string;
  logo?: number;
  initials: string;
  color: string;
  steps: string[];
}[] = [
  {
    key: "mindbody",
    label: "Mindbody",
    tagline: "International fitness platform",
    logo: require("../../assets/platforms/mindbody.png"),
    initials: "MB",
    color: "#0f172a",
    steps: [
      "Open the Mindbody Business app (not the client booking app).",
      "Log in with your staff login.",
      "Tap More, then Settings.",
      "Under Schedule, tap Export My Schedule.",
      "Tap Copy Link and paste it below.",
    ],
  },
  {
    key: "bsport",
    label: "Bsport",
    tagline: "Premium studios · France & Europe",
    logo: require("../../assets/platforms/bsport.png"),
    initials: "BS",
    color: "#0ea5e9",
    steps: [
      "Log in to Bsport from a browser or the app.",
      "Look in Settings or Calendar for an export or sync option.",
      "Copy the link it gives you and paste it below.",
    ],
  },
  {
    key: "momence",
    label: "Momence",
    tagline: "Studio & instructor scheduling",
    initials: "MO",
    color: "#7c3aed",
    steps: [
      "Log in to Momence.",
      "Find the calendar export / subscribe link for your teaching schedule.",
      "Copy the link and paste it below.",
    ],
  },
  {
    key: "other",
    label: "Other calendar link",
    tagline: "Any iCal / .ics schedule link",
    initials: "IC",
    color: "#6e5f5c",
    steps: ["Copy the calendar subscription link (usually ends in .ics) and paste it below."],
  },
];

export function PlatformBadge({ platform, size = 40 }: { platform: (typeof PLATFORMS)[number]; size?: number }) {
  if (platform.logo) {
    return <Image source={platform.logo} style={{ width: size, height: size, borderRadius: 10 }} />;
  }
  return (
    <View style={[styles.badge, { width: size, height: size, backgroundColor: platform.color }]}>
      <Text style={styles.badgeText}>{platform.initials}</Text>
    </View>
  );
}

export function ConnectFeedSheet({
  platformKey,
  studios,
  onClose,
  onConnected,
}: {
  platformKey: PlatformKey | null;
  studios: Studio[];
  onClose: () => void;
  onConnected: (result: { created: number; updated: number }) => void;
}) {
  const platform = PLATFORMS.find((p) => p.key === platformKey);
  const [url, setUrl] = useState("");
  const [studioId, setStudioId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setUrl("");
    setStudioId("");
    setError(null);
  }

  async function connect() {
    if (!platform) return;
    const trimmed = url.trim();
    if (!/^(https?|webcal):\/\//i.test(trimmed)) {
      setError("Paste the full link. It should start with https:// or webcal://");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const feed = await createIcsFeed(trimmed.replace(/^webcal:\/\//i, "https://"), platform.label, studioId || null);
      const result = await syncIcsFeed(feed.id).catch(() => ({ created: 0, updated: 0 }));
      reset();
      onConnected(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect this calendar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={!!platform} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => { reset(); onClose(); }} hitSlop={10}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {platform && (
              <>
                <View style={styles.head}>
                  <PlatformBadge platform={platform} size={52} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Connect {platform.label}</Text>
                    <Text style={styles.tagline}>{platform.tagline}</Text>
                  </View>
                </View>

                <View style={styles.steps}>
                  {platform.steps.map((s, i) => (
                    <View key={s} style={styles.step}>
                      <View style={styles.stepNum}>
                        <Text style={styles.stepNumText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{s}</Text>
                    </View>
                  ))}
                </View>

                {error && <Banner message={error} />}
                <Field
                  label="Calendar link"
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://…"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                {studios.length > 0 && (
                  <SelectSheet
                    label="Assign classes to studio (optional)"
                    value={studioId}
                    onChange={setStudioId}
                    options={[{ value: "", label: "Match automatically" }, ...studios.map((s) => ({ value: s.id, label: s.name }))]}
                  />
                )}
                <Text style={styles.note}>
                  Read-only: FORCOACH only reads your teaching schedule from this link. We never ask for your
                  {" "}{platform.label} password.
                </Text>
                <Button title="Connect" icon="link" onPress={connect} loading={busy} style={{ marginTop: 8 }} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: 20, paddingVertical: 12, alignItems: "flex-start" },
  cancel: { fontSize: 16, color: colors.accent, fontWeight: "600" },
  content: { padding: 20, paddingTop: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "800", color: colors.foreground },
  tagline: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  steps: { backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 12, marginBottom: 20 },
  step: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 12, fontWeight: "700", color: colors.accent },
  stepText: { flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 20 },
  note: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8, lineHeight: 17 },
  badge: { borderRadius: 10, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
