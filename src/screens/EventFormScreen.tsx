import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CalendarStackParamList } from "../navigation/types";
import { createEvent, deleteEvent, listEvents, updateEvent, type Event } from "../lib/api/events";
import { listStudios, type Studio } from "../lib/api/studios";
import { useCurrency } from "../lib/currency";
import { Banner, Button, Card, Field, ListRow, SectionLabel, StackScreen } from "../components/ui";
import { DateTimeField, SelectSheet } from "../components/Pickers";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<CalendarStackParamList, "EventForm">;

function withTime(day: Date, t: Date) {
  const d = new Date(day);
  d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  return d;
}

function defaultStart(dateIso?: string) {
  const base = dateIso ? new Date(dateIso) : new Date();
  const now = new Date();
  const d = new Date(base);
  d.setHours(sameDate(base, now) ? now.getHours() + 1 : 9, 0, 0, 0);
  return d;
}

function sameDate(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function minutesOfDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

/** Class names the coach has used before, most used first. */
function pastClassNames(events: Event[]) {
  const counts = new Map<string, { name: string; count: number }>();
  for (const e of events) {
    // Skip un-assigned calendar imports: those are often personal events, not classes.
    if (e.source !== "manual" && !e.studio_id) continue;
    const name = e.title.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { name, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).map((c) => c.name);
}

export function EventFormScreen({ route, navigation }: Props) {
  const existing = route.params?.event;
  const isEditing = !!existing;
  const { symbol } = useCurrency();

  const initialStart = existing ? new Date(existing.start_time) : defaultStart(route.params?.date);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [day, setDay] = useState(initialStart);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(
    existing ? new Date(existing.end_time) : new Date(initialStart.getTime() + 60 * 60 * 1000),
  );
  const [studioId, setStudioId] = useState<string>(existing?.studio_id ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [rateOverride, setRateOverride] = useState(existing?.rate_override != null ? String(existing.rate_override) : "");
  const [attendance, setAttendance] = useState(existing?.attendance_count != null ? String(existing.attendance_count) : "");
  const [excluded, setExcluded] = useState(existing?.status === "excluded");
  const [studios, setStudios] = useState<Studio[]>([]);
  const [pastNames, setPastNames] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Edit class" : "New class" });
    listStudios().then(setStudios).catch(() => {});
    listEvents()
      .then((events) => setPastNames(pastClassNames(events)))
      .catch(() => {});
  }, [isEditing, navigation]);

  const studio = studios.find((s) => s.id === studioId);

  const suggestions = useMemo(() => {
    const query = title.trim().toLowerCase();
    return pastNames
      .filter((name) => name.toLowerCase() !== query && (!query || name.toLowerCase().includes(query)))
      .slice(0, 8);
  }, [pastNames, title]);

  // Moving the start keeps the class length, so a new class (1h by default)
  // starting at 14:00 ends at 15:00 without touching the end picker.
  function handleStartChange(next: Date) {
    const length = minutesOfDay(end) - minutesOfDay(start);
    setStart(next);
    setEnd(new Date(next.getTime() + (length > 0 ? length : 60) * 60 * 1000));
  }

  async function handleSave() {
    if (!title.trim()) return setError("Give the class a title.");
    const startAt = withTime(day, start);
    const endAt = withTime(day, end);
    if (endAt <= startAt) return setError("End time must be after the start time.");
    const rate = rateOverride.trim() ? Number(rateOverride.replace(",", ".")) : null;
    if (rate != null && (Number.isNaN(rate) || rate < 0)) return setError("Enter a valid rate.");
    const count = attendance.trim() ? parseInt(attendance, 10) : null;
    if (count != null && (Number.isNaN(count) || count < 0)) return setError("Enter a valid attendance count.");

    setError(null);
    setSaving(true);
    const input = {
      title: title.trim(),
      startTime: startAt.toISOString(),
      endTime: endAt.toISOString(),
      studioId: studioId || null,
      notes: notes.trim() || undefined,
      rateOverride: rate,
      attendanceCount: count,
      status: excluded ? ("excluded" as const) : studioId ? ("assigned" as const) : ("unassigned" as const),
    };
    try {
      if (isEditing && existing) await updateEvent(existing.id, input);
      else await createEvent({ ...input, source: "manual" });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this class");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert("Delete class?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteEvent(existing.id);
            navigation.goBack();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not delete this class");
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <StackScreen footer={<Button title={isEditing ? "Save changes" : "Add class"} onPress={handleSave} loading={saving} />}>
      {error && <Banner message={error} />}
      <Field label="Class name" value={title} onChangeText={setTitle} placeholder="e.g. Reformer Flow" />
      {suggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.suggestions}
          contentContainerStyle={styles.suggestionsContent}
        >
          {suggestions.map((name) => (
            <TouchableOpacity key={name} style={styles.suggestion} onPress={() => setTitle(name)} activeOpacity={0.7}>
              <Text style={styles.suggestionText} numberOfLines={1}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <SelectSheet
        label="Studio"
        value={studioId}
        onChange={setStudioId}
        options={[{ value: "", label: "Unassigned" }, ...studios.map((s) => ({ value: s.id, label: s.name }))]}
      />

      <SectionLabel>When</SectionLabel>
      <DateTimeField label="Date" mode="date" value={day} onChange={setDay} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <DateTimeField label="Start" mode="time" value={start} onChange={handleStartChange} />
        </View>
        <View style={{ flex: 1 }}>
          <DateTimeField label="End" mode="time" value={end} onChange={setEnd} />
        </View>
      </View>

      <SectionLabel>Pay</SectionLabel>
      <Field
        label={`Rate for this class (${symbol})`}
        value={rateOverride}
        onChangeText={setRateOverride}
        keyboardType="decimal-pad"
        placeholder="Studio default"
        hint="Only if this class pays differently from the studio's usual rate."
      />
      {studio?.compensation_type === "tiered" && (
        <Field
          label="Number of clients"
          value={attendance}
          onChangeText={setAttendance}
          keyboardType="number-pad"
          placeholder="Number of clients"
          hint="How many clients came. This sets your pay for the class."
        />
      )}
      <Card padded={false}>
        <ListRow
          icon="eye-off-outline"
          label="Don't count this class"
          last
          right={<Switch value={excluded} onValueChange={setExcluded} trackColor={{ true: colors.accent, false: colors.border }} />}
        />
      </Card>

      <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline style={{ minHeight: 70, textAlignVertical: "top" }} />

      {isEditing && <Button title="Delete class" variant="destructive" icon="trash-outline" onPress={handleDelete} />}
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  suggestions: { marginTop: -4, marginBottom: 12, flexGrow: 0 },
  suggestionsContent: { gap: 8 },
  suggestion: { backgroundColor: colors.accentLight, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, maxWidth: 220 },
  suggestionText: { fontSize: 13, fontWeight: "600", color: colors.accent },
});
