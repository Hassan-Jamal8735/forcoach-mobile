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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { StudiosStackParamList } from "../../navigation/studios-types";
import { createStudio, deleteStudio, updateStudio, type CompensationType } from "../../lib/api/studios";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<StudiosStackParamList, "StudioForm">;

export function StudioFormScreen({ route, navigation }: Props) {
  const existing = route.params?.studio;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [compensationType, setCompensationType] = useState<CompensationType>(
    existing?.compensation_type ?? "per_class",
  );
  const [compensationValue, setCompensationValue] = useState(
    existing?.compensation_value != null ? String(existing.compensation_value) : "",
  );
  const [active, setActive] = useState(existing?.status !== "inactive");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Edit studio" : "Add studio" });
  }, [isEditing, navigation]);

  async function handleSave() {
    if (!name.trim()) {
      setError("Give the studio a name.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const value = compensationValue ? Number(compensationValue) : undefined;
      if (isEditing && existing) {
        await updateStudio(existing.id, {
          name: name.trim(),
          compensationType,
          compensationValue: value,
          status: active ? "active" : "inactive",
        });
      } else {
        await createStudio({
          name: name.trim(),
          compensationType,
          compensationValue: value,
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this studio");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert("Delete studio", "This can't be undone. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteStudio(existing.id);
            navigation.goBack();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete this studio");
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Studio name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Pilates Social Club"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Pay structure</Text>
      <View style={styles.segmentRow}>
        {(["per_class", "hourly"] as CompensationType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.segment, compensationType === t && styles.segmentActive]}
            onPress={() => setCompensationType(t)}
          >
            <Text style={[styles.segmentText, compensationType === t && styles.segmentTextActive]}>
              {t === "per_class" ? "Per class" : "Hourly"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Rate</Text>
      <View style={styles.rateRow}>
        <Text style={styles.currencySymbol}>€</Text>
        <TextInput
          style={styles.rateInput}
          keyboardType="decimal-pad"
          placeholder="0"
          value={compensationValue}
          onChangeText={setCompensationValue}
        />
        <Text style={styles.rateSuffix}>{compensationType === "hourly" ? "/hour" : "/class"}</Text>
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.statusRow} onPress={() => setActive((a) => !a)}>
          <Text style={styles.label}>Active</Text>
          <View style={[styles.toggle, active && styles.toggleOn]}>
            <View style={[styles.toggleKnob, active && styles.toggleKnobOn]} />
          </View>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={[styles.saveBtn, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.offWhite} /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
          <Text style={styles.deleteText}>Delete studio</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: colors.card,
    color: colors.foreground,
  },
  segmentRow: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 10, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  segmentActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
  segmentTextActive: { color: colors.foreground },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    gap: 6,
  },
  currencySymbol: { fontSize: 15, color: colors.mutedForeground },
  rateInput: { flex: 1, fontSize: 15, color: colors.foreground, paddingVertical: 12 },
  rateSuffix: { fontSize: 13, color: colors.mutedForeground },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 3,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: colors.accent },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  toggleKnobOn: { alignSelf: "flex-end" },
  error: { color: colors.destructiveText, fontSize: 13, marginTop: 16 },
  saveBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  disabled: { opacity: 0.6 },
  saveText: { color: colors.offWhite, fontSize: 15, fontWeight: "600" },
  deleteBtn: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  deleteText: { color: colors.destructive, fontSize: 14, fontWeight: "500" },
});
