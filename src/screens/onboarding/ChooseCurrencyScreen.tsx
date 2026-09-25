import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";
import { Button, Card, ListRow } from "../../components/ui";
import { colors } from "../../theme/colors";
import { CURRENCIES } from "../../lib/currency";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ChooseCurrency">;


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
            left={<Text style={{ width: 44, textAlign: "center", fontSize: c.symbol.length > 1 ? 13 : 22, fontWeight: "700", color: colors.accent }}>{c.symbol.trim()}</Text>}
            label={`${c.label} (${c.code})`}
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
