import { useState } from "react";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Banner, Button, Field, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

export function PaymentDetailsScreen() {
  const { session } = useAuth();
  const m = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
  const [bankAccountName, setBankAccountName] = useState(m.bank_account_name ?? "");
  const [bankName, setBankName] = useState(m.bank_name ?? "");
  const [iban, setIban] = useState(m.iban ?? "");
  const [bankAddress, setBankAddress] = useState(m.bank_address ?? "");
  const [bankPhone, setBankPhone] = useState(m.bank_phone ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "danger"; msg: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    const { error } = await supabase.auth.updateUser({
      data: {
        bank_account_name: bankAccountName.trim() || null,
        bank_name: bankName.trim() || null,
        iban: iban.trim() || null,
        bank_address: bankAddress.trim() || null,
        bank_phone: bankPhone.trim() || null,
      },
    });
    setSaving(false);
    setStatus(error ? { tone: "danger", msg: error.message } : { tone: "success", msg: "Bank details updated." });
  }

  return (
    <StackScreen footer={<Button title="Save bank details" onPress={handleSave} loading={saving} />}>
      {status && <Banner tone={status.tone} message={status.msg} />}
      <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 16 }}>
        Optional. Only shown on your invoices if filled in, so studios know where to send payment.
      </Text>
      <Field label="Account holder name" value={bankAccountName} onChangeText={setBankAccountName} />
      <Field label="Bank name" value={bankName} onChangeText={setBankName} />
      <Field
        label="IBAN"
        value={iban}
        onChangeText={setIban}
        autoCapitalize="characters"
        placeholder="FR76 1234 5678 9012 3456 7890 123"
      />
      <Field label="Address" value={bankAddress} onChangeText={setBankAddress} />
      <Field label="Phone number" value={bankPhone} onChangeText={setBankPhone} keyboardType="phone-pad" />
    </StackScreen>
  );
}
