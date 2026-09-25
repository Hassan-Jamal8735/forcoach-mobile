import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RateTierInput, Studio } from "../lib/api/studios";
import { colors } from "../theme/colors";

export type TierRow = { min: string; max: string; rate: string };

export const DEFAULT_TIERS: TierRow[] = [
  { min: "1", max: "5", rate: "" },
  { min: "6", max: "10", rate: "" },
  { min: "11", max: "", rate: "" },
];

export function tiersFromStudio(studio?: Studio | null): TierRow[] {
  const tiers = studio?.rate_tiers ?? [];
  if (tiers.length === 0) return DEFAULT_TIERS.map((t) => ({ ...t }));
  return [...tiers]
    .sort((a, b) => a.min_attendance - b.min_attendance)
    .map((t) => ({
      min: String(t.min_attendance),
      max: t.max_attendance == null ? "" : String(t.max_attendance),
      rate: String(t.rate),
    }));
}

/** Turns the editor rows into API tiers, or explains what's wrong in plain words. */
export function parseTiers(rows: TierRow[]): { tiers?: RateTierInput[]; error?: string } {
  if (rows.length === 0) return { error: "Add at least one attendance bracket." };
  if (rows.some((r) => !r.rate.trim() || !r.min.trim())) return { error: "Fill in the clients and the rate for every bracket." };
  const tiers = rows.map((r) => ({
    minAttendance: parseInt(r.min, 10),
    maxAttendance: r.max.trim() ? parseInt(r.max, 10) : undefined,
    rate: Number(r.rate.replace(",", ".")),
  }));
  for (const t of tiers) {
    if (Number.isNaN(t.minAttendance) || t.minAttendance < 0) return { error: "Each bracket needs a starting number of clients." };
    if (t.maxAttendance != null && (Number.isNaN(t.maxAttendance) || t.maxAttendance < t.minAttendance)) {
      return { error: "In each bracket, the second number must be at least the first." };
    }
    if (Number.isNaN(t.rate) || t.rate < 0) return { error: "Enter a valid rate for every bracket." };
  }
  const sorted = [...tiers].sort((a, b) => a.minAttendance - b.minAttendance);
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    if (cur.maxAttendance == null) return { error: "Only the last bracket can be open-ended (\"and up\")." };
    if (sorted[i + 1].minAttendance <= cur.maxAttendance) return { error: "Brackets overlap. Check the client numbers." };
  }
  return { tiers: sorted };
}

export function TierEditor({ rows, onChange, symbol }: { rows: TierRow[]; onChange: (rows: TierRow[]) => void; symbol: string }) {
  function update(i: number, patch: Partial<TierRow>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const lastMax = last?.max.trim() ? parseInt(last.max, 10) : NaN;
    const nextMin = Number.isNaN(lastMax) ? "" : String(lastMax + 1);
    onChange([...rows, { min: nextMin, max: "", rate: "" }]);
  }

  return (
    <View>
      <View style={styles.headRow}>
        <Text style={[styles.head, { flex: 1 }]}>Clients</Text>
        <Text style={[styles.head, { width: 104, textAlign: "right" }]}>Pay per class</Text>
        <View style={{ width: 28 }} />
      </View>
      {rows.map((r, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.range}>
            <TextInput
              style={styles.num}
              value={r.min}
              onChangeText={(v) => update(i, { min: v.replace(/\D/g, "") })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={styles.to}>to</Text>
            <TextInput
              style={styles.num}
              value={r.max}
              onChangeText={(v) => update(i, { max: v.replace(/\D/g, "") })}
              keyboardType="number-pad"
              placeholder="+"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={styles.rateBox}>
            <Text style={styles.symbol}>{symbol}</Text>
            <TextInput
              style={styles.rate}
              value={r.rate}
              onChangeText={(v) => update(i, { rate: v })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <TouchableOpacity
            onPress={() => onChange(rows.filter((_, idx) => idx !== i))}
            hitSlop={8}
            disabled={rows.length === 1}
            style={{ width: 28, alignItems: "flex-end", opacity: rows.length === 1 ? 0.3 : 1 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.add} onPress={addRow}>
        <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
        <Text style={styles.addText}>Add bracket</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Leave the last box empty for "and up". You'll enter the number of clients after each class.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  head: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  range: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  num: {
    width: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 9,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  to: { fontSize: 13, color: colors.mutedForeground },
  rateBox: {
    width: 104,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
  },
  symbol: { fontSize: 13, color: colors.mutedForeground },
  rate: { flex: 1, textAlign: "right", fontSize: 15, fontWeight: "700", color: colors.foreground, paddingVertical: 9 },
  add: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  addText: { fontSize: 14, fontWeight: "700", color: colors.accent },
  hint: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, lineHeight: 17 },
});
