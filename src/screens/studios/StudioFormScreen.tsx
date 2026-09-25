import { useEffect, useState } from "react";
import { Alert, Switch, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "../../navigation/settings-types";
import { createStudio, deleteStudio, updateStudio } from "../../lib/api/studios";
import { TierEditor, parseTiers, tiersFromStudio, type TierRow } from "../../components/TierEditor";
import { useCurrency } from "../../lib/currency";
import { Banner, Button, Card, Field, ListRow, SectionLabel, Segmented, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<SettingsStackParamList, "StudioForm">;

export function StudioFormScreen({ route, navigation }: Props) {
  const existing = route.params?.studio;
  const isEditing = !!existing;
  const wasHourly = existing?.compensation_type === "hourly";
  const { symbol } = useCurrency();

  const [name, setName] = useState(existing?.name ?? "");
  // Hourly is no longer offered; an existing hourly studio keeps it until a new type is chosen.
  const [type, setType] = useState<"per_class" | "tiered" | null>(
    existing?.compensation_type === "tiered" ? "tiered" : wasHourly ? null : "per_class",
  );
  const [tiers, setTiers] = useState<TierRow[]>(() => tiersFromStudio(existing));
  const [rate, setRate] = useState(existing?.compensation_value != null ? String(existing.compensation_value) : "");
  const [active, setActive] = useState(existing?.status !== "inactive");
  const [contactPerson, setContactPerson] = useState(existing?.contact_person ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Edit studio" : "New studio" });
  }, [isEditing, navigation]);

  async function handleSave() {
    if (!name.trim()) return setError("Give the studio a name.");
    let pay: Record<string, unknown> = {};
    if (type === "per_class") {
      const value = rate.trim() ? Number(rate.replace(",", ".")) : NaN;
      if (Number.isNaN(value) || value < 0) return setError("Enter a valid rate per class.");
      pay = { compensationType: "per_class", compensationValue: value };
    } else if (type === "tiered") {
      const parsed = parseTiers(tiers);
      if (parsed.error) return setError(parsed.error);
      pay = { compensationType: "tiered", rateTiers: parsed.tiers };
    }
    setError(null);
    setSaving(true);
    const contact = {
      contactPerson: contactPerson.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    try {
      if (isEditing && existing) {
        await updateStudio(existing.id, {
          name: name.trim(),
          ...pay,
          status: active ? "active" : "inactive",
          ...contact,
        });
      } else {
        await createStudio({ name: name.trim(), ...(pay as { compensationType: "per_class" | "tiered" }), ...contact });
      }
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this studio");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!existing) return;
    Alert.alert(`Delete ${existing.name}?`, "Its classes will become unassigned. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteStudio(existing.id);
            navigation.goBack();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not delete this studio");
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <StackScreen footer={<Button title={isEditing ? "Save changes" : "Add studio"} onPress={handleSave} loading={saving} />}>
      {error && <Banner message={error} />}
      <Field label="Studio name" value={name} onChangeText={setName} placeholder="e.g. Pilates Social Club" />

      <SectionLabel>Pay</SectionLabel>
      {wasHourly && type === null && (
        <Banner tone="info" message={`This studio is currently paid hourly (${symbol}${existing?.compensation_value ?? 0} per hour). Choose a pay type below to change it.`} />
      )}
      <Segmented
        options={[
          { value: "per_class", label: "Per class" },
          { value: "tiered", label: "Per attendance" },
        ]}
        value={type ?? ("" as "per_class")}
        onChange={setType}
      />
      <View style={{ height: 14 }} />
      {type === "per_class" && (
        <Field label={`Rate per class (${symbol.trim()})`} value={rate} onChangeText={setRate} placeholder="0" keyboardType="decimal-pad" />
      )}
      {type === "tiered" && (
        <Card>
          <TierEditor rows={tiers} onChange={setTiers} symbol={symbol.trim()} />
        </Card>
      )}

      {isEditing && (
        <Card padded={false}>
          <ListRow
            icon="power-outline"
            label="Active"
            last
            right={<Switch value={active} onValueChange={setActive} trackColor={{ true: colors.accent, false: colors.border }} />}
          />
        </Card>
      )}

      <SectionLabel>Contact (optional)</SectionLabel>
      <Field label="Contact person" value={contactPerson} onChangeText={setContactPerson} />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Address" value={address} onChangeText={setAddress} hint="Shown on invoices you send this studio" />
      <Field label="Notes" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />

      {isEditing && (
        <Button title="Delete studio" variant="destructive" icon="trash-outline" onPress={handleDelete} style={{ marginTop: 8 }} />
      )}
      <Text style={{ height: 8 }} />
    </StackScreen>
  );
}
