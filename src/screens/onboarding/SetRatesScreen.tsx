import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";
import { updateStudio, type CompensationType } from "../../lib/api/studios";
import { Avatar, Banner, Button, Card, EmptyState, initials } from "../../components/ui";
import { colors, studioColor } from "../../theme/colors";
import { currencySymbol } from "../../lib/currency";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetRates">;


export function SetRatesScreen({ navigation }: Props) {
  const { studios, currency } = useOnboarding();
  const [rates, setRates] = useState<Record<string, string>>(() =>
    Object.fromEntries(studios.map((s) => [s.id, s.compensation_value ? String(s.compensation_value) : ""])),
  );
  const [types, setTypes] = useState<Record<string, CompensationType>>(() =>
    Object.fromEntries(studios.map((s) => [s.id, s.compensation_type === "hourly" ? "hourly" : "per_class"])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const symbol = currencySymbol(currency).trim();
  const editable = studios.filter((s) => s.compensation_type !== "tiered");

  async function handleNext() {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        editable.map((s) => {
          const value = Number((rates[s.id] ?? "").replace(",", "."));
          if (!rates[s.id]?.trim() || Number.isNaN(value) || value < 0) return Promise.resolve();
          return updateStudio(s.id, { compensationType: types[s.id] ?? "per_class", compensationValue: value });
        }),
      );
      navigation.navigate("ChooseCurrency");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your rates");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingLayout
      step={3}
      onBack={() => navigation.goBack()}
      title="Set your rates"
      subtitle="Your default pay for each studio. You can always change this later."
      footer={<Button title="Next" icon="arrow-forward" variant="dark" onPress={handleNext} loading={saving} />}
    >
      {error && <Banner message={error} />}
      {editable.length === 0 ? (
        <EmptyState icon="cash-outline" title="No studios yet" subtitle="You can set rates any time in Settings, under Studios." />
      ) : (
        editable.map((s) => {
          const type = types[s.id] ?? "per_class";
          return (
            <Card key={s.id}>
              <View style={styles.head}>
                <Avatar label={initials(s.name)} color={studioColor(s.id)} size={34} />
                <Text style={styles.name} numberOfLines={1}>
                  {s.name}
                </Text>
              </View>
              <View style={styles.row}>
                <View style={styles.chips}>
                  {(["per_class", "hourly"] as CompensationType[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, type === t && styles.chipActive]}
                      onPress={() => setTypes((p) => ({ ...p, [s.id]: t }))}
                    >
                      <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t === "per_class" ? "Per class" : "Hourly"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.rateBox}>
                  <Text style={styles.symbol}>{symbol}</Text>
                  <TextInput
                    style={styles.rateInput}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.mutedForeground}
                    value={rates[s.id] ?? ""}
                    onChangeText={(v) => setRates((p) => ({ ...p, [s.id]: v }))}
                  />
                </View>
              </View>
            </Card>
          );
        })
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  name: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.foreground },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  chips: { flex: 1, flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 10, padding: 3, gap: 3 },
  chip: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  chipActive: { backgroundColor: colors.card },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
  chipTextActive: { color: colors.foreground },
  rateBox: {
    flexDirection: "row",
    alignItems: "center",
    width: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
  },
  symbol: { fontSize: 15, color: colors.mutedForeground },
  rateInput: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.foreground, paddingVertical: 9, textAlign: "right" },
});
