import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingHeader } from "../../components/OnboardingHeader";
import { useOnboarding } from "../../context/OnboardingContext";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ChooseCurrency">;

const CURRENCIES = [
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£" },
];

export function ChooseCurrencyScreen({ navigation }: Props) {
  const { currency, setCurrency } = useOnboarding();

  return (
    <View style={styles.container}>
      <OnboardingHeader step={4} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Choose your currency</Text>
        <Text style={styles.subtitle}>
          This will be used for your earnings and invoices.
        </Text>

        {CURRENCIES.map((c) => {
          const selected = currency === c.code;
          return (
            <TouchableOpacity
              key={c.code}
              style={styles.row}
              onPress={() => setCurrency(c.code)}
            >
              <Text style={styles.symbol}>{c.symbol}</Text>
              <Text style={styles.label}>{c.label}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => navigation.navigate("ChoosePlan")}
      >
        <Text style={styles.nextBtnText}>Next  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 12,
  },
  symbol: { fontSize: 17, width: 20, color: colors.foreground },
  label: { flex: 1, fontSize: 15, color: colors.foreground },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
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
