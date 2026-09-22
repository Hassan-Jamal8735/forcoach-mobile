import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

export function ProfileScreen() {
  const { session } = useAuth();
  const metadata = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
  const [fullName, setFullName] = useState(metadata.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
      if (error) throw error;
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Email</Text>
      <View style={styles.readonly}>
        <Text style={styles.readonlyText}>{session?.user.email}</Text>
      </View>

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your name" />

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.success}>Saved.</Text>}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.offWhite} /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
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
  readonly: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
  },
  readonlyText: { fontSize: 15, color: colors.mutedForeground },
  error: { color: colors.destructiveText, fontSize: 13, marginTop: 16 },
  success: { color: colors.successText, fontSize: 13, marginTop: 16 },
  saveBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: colors.offWhite, fontSize: 15, fontWeight: "600" },
});
