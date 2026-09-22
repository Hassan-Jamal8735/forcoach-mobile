import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

export function PaymentDetailsScreen() {
  const { session } = useAuth();
  const metadata = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;

  const [bankAccountName, setBankAccountName] = useState(metadata.bank_account_name ?? "");
  const [bankName, setBankName] = useState(metadata.bank_name ?? "");
  const [iban, setIban] = useState(metadata.iban ?? "");
  const [bankAddress, setBankAddress] = useState(metadata.bank_address ?? "");
  const [bankPhone, setBankPhone] = useState(metadata.bank_phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          bank_account_name: bankAccountName.trim(),
          bank_name: bankName.trim(),
          iban: iban.trim(),
          bank_address: bankAddress.trim(),
          bank_phone: bankPhone.trim(),
        },
      });
      if (error) throw error;
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your payment details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>
        Optional — only shown on your invoices if filled in, so studios know where to send payment.
      </Text>

      <Text style={styles.label}>Account holder name</Text>
      <TextInput style={styles.input} value={bankAccountName} onChangeText={setBankAccountName} />

      <Text style={styles.label}>Bank name</Text>
      <TextInput style={styles.input} value={bankName} onChangeText={setBankName} />

      <Text style={styles.label}>IBAN</Text>
      <TextInput
        style={styles.input}
        value={iban}
        onChangeText={setIban}
        placeholder="e.g. FR76 1234 5678 9012 3456 7890 123"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={bankAddress} onChangeText={setBankAddress} />

      <Text style={styles.label}>Phone number</Text>
      <TextInput style={styles.input} value={bankPhone} onChangeText={setBankPhone} keyboardType="phone-pad" />

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.success}>Saved.</Text>}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.offWhite} /> : <Text style={styles.saveText}>Save bank details</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, marginTop: 14, marginBottom: 6 },
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
