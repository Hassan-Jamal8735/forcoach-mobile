import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { listSupportMessages, markSupportRead, sendSupportMessage, type SupportMessage } from "../../lib/api/support";
import { Banner, EmptyState, Loading } from "../../components/ui";
import { colors } from "../../theme/colors";

export function SupportScreen() {
  const [messages, setMessages] = useState<SupportMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<SupportMessage>>(null);
  const headerHeight = useHeaderHeight();

  useFocusEffect(
    useCallback(() => {
      listSupportMessages()
        .then((m) => {
          setMessages(m);
          markSupportRead().catch(() => {});
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Could not load messages"));
    }, []),
  );

  async function send() {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendSupportMessage(body);
      setMessages((prev) => [...(prev ?? []), msg]);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your message");
    } finally {
      setSending(false);
    }
  }

  if (!messages && !error) return <Loading />;

  const canSend = !!draft.trim() && !sending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {error && (
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Banner message={error} />
        </View>
      )}
      <FlatList
        ref={listRef}
        data={messages ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="How can we help?"
            subtitle="Send us a message and the FORCOACH team will reply here."
          />
        }
        renderItem={({ item }) => {
          const mine = item.sender === "user";
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.bubbleText, mine && { color: colors.accentForeground }]}>{item.body}</Text>
              <Text style={[styles.time, mine && { color: "rgba(255,255,255,0.75)" }]}>
                {new Date(item.created_at).toLocaleString(undefined, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />
      <SafeAreaView edges={["bottom"]} style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Write a message…"
          placeholderTextColor={colors.mutedForeground}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <TouchableOpacity style={[styles.send, !canSend && { opacity: 0.4 }]} onPress={send} disabled={!canSend}>
          <Ionicons name="arrow-up" size={20} color={colors.accentForeground} />
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: { maxWidth: "80%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  mine: { alignSelf: "flex-end", backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.card, borderBottomLeftRadius: 6 },
  bubbleText: { fontSize: 15, color: colors.foreground },
  time: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 42,
    backgroundColor: colors.background,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 8,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});
