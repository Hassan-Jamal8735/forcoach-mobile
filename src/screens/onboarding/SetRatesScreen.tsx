import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";
import { updateStudio } from "../../lib/api/studios";
import { currencySymbol } from "../../lib/currency";
import { TierEditor, parseTiers, tiersFromStudio, type TierRow } from "../../components/TierEditor";
import { Avatar, Banner, Button, Card, EmptyState, initials } from "../../components/ui";
import { colors, studioColor } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetRates">;
type PayType = "per_class" | "tiered";

export function SetRatesScreen({ navigation }: Props) {
  const { studios, currency } = useOnboarding();
  const [types, setTypes] = useState<Record<string, PayType>>(() =>
    Object.fromEntries(studios.map((s) => [s.id, s.compensation_type === "tiered" ? "tiered" : "per_class"])),
  );
  const [rates, setRates] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      studios.map((s) => [s.id, s.compensation_type === "per_class" && s.compensation_value ? String(s.compensation_value) : ""]),
    ),
  );
  const [tiers, setTiers] = useState<Record<string, TierRow[]>>(() =>
    Object.fromEntries(studios.map((s) => [s.id, tiersFromStudio(s)])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const symbol = currencySymbol(currency).trim();

  async function handleNext() {
    setError(null);
    const updates: Promise<unknown>[] = [];
    for (const s of studios) {
      const type = types[s.id] ?? "per_class";
      if (type === "tiered") {
        const parsed = parseTiers(tiers[s.id] ?? []);
        if (parsed.error) return setError(`${s.name}: ${parsed.error}`);
        updates.push(updateStudio(s.id, { compensationType: "tiered", rateTiers: parsed.tiers }));
      } else {
        const raw = (rates[s.id] ?? "").trim();
        if (!raw) continue;
        const value = Number(raw.replace(",", "."));
        if (Number.isNaN(value) || value < 0) return setError(`${s.name}: enter a valid rate.`);
        updates.push(updateStudio(s.id, { compensationType: "per_class", compensationValue: value }));
      }
    }
    setSaving(true);
    try {
      await Promise.all(updates);
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
      subtitle="How each studio pays you. You can always change this later."
      footer={<Button title="Next" icon="arrow-forward" variant="dark" onPress={handleNext} loading={saving} />}
    >
      {error && <Banner message={error} />}
      {studios.length === 0 ? (
        <EmptyState icon="cash-outline" title="No studios yet" subtitle="You can set rates any time in Settings, under Studios." />
      ) : (
        studios.map((s) => {
          const type = types[s.id] ?? "per_class";
          return (
            <Card key={s.id}>
              <View style={styles.head}>
                <Avatar label={initials(s.name)} color={studioColor(s.id)} size={34} />
                <Text style={styles.name} numberOfLines={1}>
                  {s.name}
                </Text>
              </View>
              <View style={styles.chips}>
                {(["per_class", "tiered"] as PayType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, type === t && styles.chipActive]}
                    onPress={() => setTypes((p) => ({ ...p, [s.id]: t }))}
                  >
                    <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                      {t === "per_class" ? "Per class" : "Per attendance"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {type === "per_class" ? (
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>Pay per class</Text>
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
              ) : (
                <View style={{ marginTop: 14 }}>
                  <TierEditor
                    rows={tiers[s.id] ?? []}
                    onChange={(rows) => setTiers((p) => ({ ...p, [s.id]: rows }))}
                    symbol={symbol}
                  />
                </View>
              )}
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
  chips: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 10, padding: 3, gap: 3 },
  chip: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  chipActive: { backgroundColor: colors.card },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  chipTextActive: { color: colors.foreground },
  rateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  rateLabel: { fontSize: 14, color: colors.foreground },
  rateBox: {
    flexDirection: "row",
    alignItems: "center",
    width: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
  },
  symbol: { fontSize: 14, color: colors.mutedForeground },
  rateInput: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.foreground, paddingVertical: 9, textAlign: "right" },
});
