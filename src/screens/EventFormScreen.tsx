import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CalendarStackParamList } from "../navigation/types";
import { createEvent, deleteEvent, updateEvent } from "../lib/api/events";
import { listStudios, type Studio } from "../lib/api/studios";

type Props = NativeStackScreenProps<CalendarStackParamList, "EventForm">;

export function EventFormScreen({ route, navigation }: Props) {
  const existing = route.params?.event;
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [startTime, setStartTime] = useState(
    existing ? new Date(existing.start_time) : roundToNextHour(new Date()),
  );
  const [endTime, setEndTime] = useState(
    existing
      ? new Date(existing.end_time)
      : new Date(roundToNextHour(new Date()).getTime() + 60 * 60 * 1000),
  );
  const [studioId, setStudioId] = useState<string | null>(existing?.studio_id ?? null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [showStartPicker, setShowStartPicker] = useState<"date" | "time" | null>(null);
  const [showEndPicker, setShowEndPicker] = useState<"date" | "time" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Edit class" : "Add class" });
    listStudios()
      .then(setStudios)
      .catch(() => {});
  }, [isEditing, navigation]);

  function roundToNextHour(d: Date) {
    const copy = new Date(d);
    copy.setMinutes(0, 0, 0);
    copy.setHours(copy.getHours() + 1);
    return copy;
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Give the class a title.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after the start time.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        studioId,
        notes: notes.trim() || undefined,
      };
      if (isEditing && existing) {
        await updateEvent(existing.id, input);
      } else {
        await createEvent({ ...input, source: "manual" as const, status: studioId ? "assigned" : "unassigned" });
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this class");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert("Delete class", "This can't be undone from here. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteEvent(existing.id);
            navigation.goBack();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete this class");
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Reformer Flow"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Studio</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={studioId ?? ""} onValueChange={(v) => setStudioId(v || null)}>
          <Picker.Item label="Unassigned" value="" />
          {studios.map((s) => (
            <Picker.Item key={s.id} label={s.name} value={s.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Start</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker("date")}>
          <Text>{startTime.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker("time")}>
          <Text>
            {startTime.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode={showStartPicker}
          onChange={(_, selected) => {
            setShowStartPicker(null);
            if (selected) setStartTime(selected);
          }}
        />
      )}

      <Text style={styles.label}>End</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker("date")}>
          <Text>{endTime.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker("time")}>
          <Text>
            {endTime.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>
      </View>
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode={showEndPicker}
          onChange={(_, selected) => {
            setShowEndPicker(null);
            if (selected) setEndTime(selected);
          }}
        />
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Optional"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.disabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
          <Text style={styles.deleteText}>Delete class</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  notesInput: { minHeight: 80, textAlignVertical: "top" },
  pickerWrap: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10 },
  row: { flexDirection: "row", gap: 10 },
  dateBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  error: { color: "#dc2626", fontSize: 13, marginTop: 16 },
  saveBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  disabled: { opacity: 0.6 },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  deleteBtn: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  deleteText: { color: "#dc2626", fontSize: 14, fontWeight: "500" },
});
