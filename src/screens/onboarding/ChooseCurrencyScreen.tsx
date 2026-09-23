import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";
import { Button, Card, ListRow } from "../../components/ui";
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
    <OnboardingLayout
      step={4}
      onBack={() => navigation.goBack()}
      title="Choose your currency"
      subtitle="Used for your earnings and invoices."
      footer={<Button title="Next" icon="arrow-forward" variant="dark" onPress={() => navigation.navigate("ChoosePlan")} />}
    >
      <Card padded={false}>
        {CURRENCIES.map((c, i) => (
          <ListRow
            key={c.code}
            left={<Text style={{ width: 34, textAlign: "center", fontSize: 22, color: colors.accent }}>{c.symbol}</Text>}
            label={c.label}
            onPress={() => setCurrency(c.code)}
            last={i === CURRENCIES.length - 1}
            right={
              <Ionicons
                name={currency === c.code ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={currency === c.code ? colors.accent : colors.border}
              />
            }
          />
        ))}
      </Card>
    </OnboardingLayout>
  );
}
