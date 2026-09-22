import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "../../navigation/invoices-types";
import { createInvoice } from "../../lib/api/invoices";
import { listStudios, type Studio } from "../../lib/api/studios";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<InvoicesStackParamList, "CreateInvoice">;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function CreateInvoiceScreen({ navigation }: Props) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [studioId, setStudioId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState(startOfMonth(new Date()));
  const [periodEnd, setPeriodEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listStudios().then((data) => {
      setStudios(data);
      if (data.length > 0) setStudioId(data[0].id);
    });
  }, []);

  async function handleCreate() {
    if (!studioId) {
      setError("Choose a studio first.");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const invoice = await createInvoice({
        studioId,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      });
      navigation.replace("InvoiceDetail", { invoiceId: invoice.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create this invoice");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Studio</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={studioId} onValueChange={setStudioId}>
          {studios.map((s) => (
            <Picker.Item key={s.id} label={s.name} value={s.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Period start</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
        <Text>{periodStart.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={periodStart}
          mode="date"
          onChange={(_, selected) => {
            setShowStartPicker(false);
            if (selected) setPeriodStart(selected);
          }}
        />
      )}

      <Text style={styles.label}>Period end</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
        <Text>{periodEnd.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={periodEnd}
          mode="date"
          onChange={(_, selected) => {
            setShowEndPicker(false);
            if (selected) setPeriodEnd(selected);
          }}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating}>
        {creating ? (
          <ActivityIndicator color={colors.offWhite} />
        ) : (
          <Text style={styles.createBtnText}>Create invoice</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, marginTop: 16, marginBottom: 6 },
  pickerWrap: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.card },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
  },
  error: { color: colors.destructiveText, fontSize: 13, marginTop: 16 },
  createBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  createBtnText: { color: colors.offWhite, fontSize: 15, fontWeight: "600" },
});
