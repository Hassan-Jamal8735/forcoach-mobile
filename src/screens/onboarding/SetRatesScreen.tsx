import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingHeader } from "../../components/OnboardingHeader";
import { useOnboarding } from "../../context/OnboardingContext";
import { updateStudio } from "../../lib/api/studios";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "SetRates">;

export function SetRatesScreen({ navigation }: Props) {
  const { studios } = useOnboarding();
  const [rates, setRates] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    setSaving(true);
    try {
      await Promise.all(
        studios.map((studio) => {
          const value = Number(rates[studio.id]);
          if (!value || Number.isNaN(value)) return Promise.resolve();
          return updateStudio(studio.id, {
            compensationType: "per_class",
            compensationValue: value,
          });
        }),
      );
    } catch {
      // Rates can always be fixed later from Settings — don't block onboarding on this.
    } finally {
      setSaving(false);
      navigation.navigate("ChooseCurrency");
    }
  }

  return (
    <View style={styles.container}>
      <OnboardingHeader step={3} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Set your rates</Text>
        <Text style={styles.subtitle}>
          Add your default pay rate for each studio. You can always change this later.
        </Text>

        {studios.length === 0 ? (
          <Text style={styles.empty}>
            No studios added yet — you can set rates any time from Settings.
          </Text>
        ) : (
          studios.map((studio) => (
            <View key={studio.id} style={styles.row}>
              <Text style={styles.studioName}>{studio.name}</Text>
              <View style={styles.rateInputWrap}>
                <Text style={styles.currencySymbol}>€</Text>
                <TextInput
                  style={styles.rateInput}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  value={rates[studio.id] ?? ""}
                  onChangeText={(v) => setRates((prev) => ({ ...prev, [studio.id]: v }))}
                />
                <Text style={styles.perClass}>/class</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.offWhite} />
        ) : (
          <Text style={styles.nextBtnText}>Next  →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 24 },
  empty: { fontSize: 14, color: colors.mutedForeground },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  studioName: { fontSize: 15, color: colors.foreground, fontWeight: "500", flex: 1 },
  rateInputWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  currencySymbol: { fontSize: 15, color: colors.mutedForeground },
  rateInput: { width: 50, fontSize: 15, color: colors.foreground, textAlign: "right" },
  perClass: { fontSize: 13, color: colors.mutedForeground },
  nextBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  nextBtnText: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
});
