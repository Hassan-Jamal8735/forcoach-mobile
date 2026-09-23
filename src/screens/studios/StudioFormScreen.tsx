import { useEffect, useState } from "react";
import { Alert, Switch, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "../../navigation/settings-types";
import { createStudio, deleteStudio, updateStudio, type CompensationType } from "../../lib/api/studios";
import { useCurrency } from "../../lib/currency";
import { Banner, Button, Card, Field, ListRow, SectionLabel, Segmented, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<SettingsStackParamList, "StudioForm">;

export function StudioFormScreen({ route, navigation }: Props) {
  const existing = route.params?.studio;
  const isEditing = !!existing;
  const isTiered = existing?.compensation_type === "tiered";
  const { symbol } = useCurrency();

  const [name, setName] = useState(existing?.name ?? "");
  const [type, setType] = useState<CompensationType>(existing?.compensation_type === "hourly" ? "hourly" : "per_class");
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
    const value = rate.trim() ? Number(rate.replace(",", ".")) : undefined;
    if (!isTiered && (value == null || Number.isNaN(value) || value < 0)) return setError("Enter a valid rate.");
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
          ...(isTiered ? {} : { compensationType: type, compensationValue: value }),
          status: active ? "active" : "inactive",
          ...contact,
        });
      } else {
        await createStudio({ name: name.trim(), compensationType: type, compensationValue: value, ...contact });
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
      {isTiered ? (
        <Banner tone="info" message="This studio pays by attendance tiers — edit its tiers on forcoach.io." />
      ) : (
        <>
          <Segmented
            options={[
              { value: "per_class", label: "Per class" },
              { value: "hourly", label: "Hourly" },
            ]}
            value={type}
            onChange={setType}
          />
          <View style={{ height: 12 }} />
          <Field
            label={type === "hourly" ? `Rate per hour (${symbol})` : `Rate per class (${symbol})`}
            value={rate}
            onChangeText={setRate}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </>
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
