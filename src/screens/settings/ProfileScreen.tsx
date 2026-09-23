import { useState } from "react";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Banner, Button, Card, Field, ListRow, SectionLabel, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

export function ProfileScreen() {
  const { session } = useAuth();
  const m = (session?.user.user_metadata ?? {}) as Record<string, unknown>;
  const [fullName, setFullName] = useState((m.full_name as string) ?? "");
  const [siret, setSiret] = useState((m.siret as string) ?? "");
  const [vat, setVat] = useState(m.default_vat_rate != null ? String(m.default_vat_rate) : "");
  const [timezone, setTimezone] = useState((m.timezone as string) ?? "UTC");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "danger"; msg: string } | null>(null);
  const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function handleSave() {
    setStatus(null);
    const vatNumber = vat.trim() ? Number(vat.replace(",", ".")) : null;
    if (vatNumber != null && (Number.isNaN(vatNumber) || vatNumber < 0 || vatNumber > 100)) {
      setStatus({ tone: "danger", msg: "VAT rate must be a number between 0 and 100." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), siret: siret.trim() || null, default_vat_rate: vatNumber, timezone },
    });
    setSaving(false);
    setStatus(error ? { tone: "danger", msg: error.message } : { tone: "success", msg: "Profile updated." });
  }

  return (
    <StackScreen footer={<Button title="Save changes" onPress={handleSave} loading={saving} />}>
      {status && <Banner tone={status.tone} message={status.msg} />}
      <Field label="Email" value={session?.user.email ?? ""} editable={false} style={{ color: colors.mutedForeground }} />
      <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" />

      <SectionLabel>Invoicing</SectionLabel>
      <Field label="SIRET" value={siret} onChangeText={setSiret} placeholder="Shown on your invoices" keyboardType="number-pad" />
      <Field
        label="Default VAT rate (%)"
        value={vat}
        onChangeText={setVat}
        placeholder="Leave empty if you don't charge VAT"
        keyboardType="decimal-pad"
      />

      <SectionLabel>Timezone</SectionLabel>
      <Card padded={false}>
        <ListRow icon="globe-outline" label={timezone} last={timezone === deviceTz} />
        {timezone !== deviceTz && (
          <ListRow icon="locate-outline" label={`Use this device (${deviceTz})`} onPress={() => setTimezone(deviceTz)} last />
        )}
      </Card>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, marginLeft: 4 }}>
        Used to show your classes at the right local time.
      </Text>
    </StackScreen>
  );
}
