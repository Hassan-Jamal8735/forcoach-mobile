import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

const CURRENCIES = [
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£" },
];

export function CurrencyScreen() {
  const { session } = useAuth();
  const [currency, setCurrency] = useState(
    (session?.user.user_metadata?.currency as string | undefined) ?? "EUR",
  );
  const [saving, setSaving] = useState(false);

  async function handleSelect(code: string) {
    setCurrency(code);
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { currency: code } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {CURRENCIES.map((c) => {
        const selected = currency === c.code;
        return (
          <TouchableOpacity key={c.code} style={styles.row} onPress={() => handleSelect(c.code)}>
            <Text style={styles.symbol}>{c.symbol}</Text>
            <Text style={styles.label}>{c.label}</Text>
            {saving && selected ? (
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
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
});
