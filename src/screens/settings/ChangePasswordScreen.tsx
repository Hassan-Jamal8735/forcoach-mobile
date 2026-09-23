import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Banner, Button, Field, StackScreen } from "../../components/ui";

export function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "danger"; msg: string } | null>(null);

  async function handleSave() {
    setStatus(null);
    if (password.length < 8) return setStatus({ tone: "danger", msg: "Password must be at least 8 characters." });
    if (password !== confirm) return setStatus({ tone: "danger", msg: "Passwords don't match." });
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return setStatus({ tone: "danger", msg: error.message });
    setPassword("");
    setConfirm("");
    setStatus({ tone: "success", msg: "Password updated." });
  }

  return (
    <StackScreen footer={<Button title="Update password" onPress={handleSave} loading={saving} />}>
      {status && <Banner tone={status.tone} message={status.msg} />}
      <Field label="New password" value={password} onChangeText={setPassword} secure hint="At least 8 characters" />
      <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secure />
    </StackScreen>
  );
}
