import { useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Card, ListRow, StackScreen } from "../../components/ui";
import { colors } from "../../theme/colors";

const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "GBP", label: "British Pound", symbol: "£" },
];

export function CurrencyScreen() {
  const { session } = useAuth();
  const [currency, setCurrency] = useState((session?.user.user_metadata?.currency as string | undefined) ?? "EUR");
  const [saving, setSaving] = useState<string | null>(null);

  async function select(code: string) {
    setCurrency(code);
    setSaving(code);
    await supabase.auth.updateUser({ data: { currency: code } });
    setSaving(null);
  }

  return (
    <StackScreen>
      <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 12 }}>
        Used for your earnings and invoices.
      </Text>
      <Card padded={false}>
        {CURRENCIES.map((c, i) => (
          <ListRow
            key={c.code}
            left={<Text style={{ width: 34, textAlign: "center", fontSize: 20, color: colors.accent }}>{c.symbol}</Text>}
            label={`${c.label} (${c.code})`}
            onPress={() => select(c.code)}
            last={i === CURRENCIES.length - 1}
            right={
              saving === c.code ? (
                <ActivityIndicator color={colors.accent} />
              ) : currency === c.code ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={colors.border} />
              )
            }
          />
        ))}
      </Card>
    </StackScreen>
  );
}
