import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { SelectField } from "./ui";

export type Option<T extends string> = { value: T; label: string; subtitle?: string };

/** Bottom-sheet select — replaces the dated inline wheel picker. */
export function SelectSheet<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}: {
  label?: string;
  value: T | null;
  options: Option<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <SelectField label={label} value={current?.label ?? placeholder} onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
          <ScrollView style={{ maxHeight: 420 }}>
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <TouchableOpacity
                  key={o.value}
                  style={styles.option}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionText, selected && styles.optionSelected]}>{o.label}</Text>
                    {o.subtitle ? <Text style={styles.optionSub}>{o.subtitle}</Text> : null}
                  </View>
                  {selected && <Ionicons name="checkmark" size={20} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

/** Date / time field: native compact pill on iOS, tap-to-open dialog on Android. */
export function DateTimeField({
  label,
  value,
  mode,
  onChange,
}: {
  label?: string;
  value: Date;
  mode: "date" | "time";
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === "ios") {
    return (
      <View style={styles.iosRow}>
        {label ? <Text style={styles.iosLabel}>{label}</Text> : null}
        <DateTimePicker
          value={value}
          mode={mode}
          display="compact"
          accentColor={colors.accent}
          onChange={(_, d) => d && onChange(d)}
        />
      </View>
    );
  }

  const display =
    mode === "date"
      ? value.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
      : value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <SelectField
        label={label}
        value={display}
        icon={mode === "date" ? "calendar-outline" : "time-outline"}
        onPress={() => setOpen(true)}
      />
      {open && (
        <DateTimePicker
          value={value}
          mode={mode}
          onChange={(_, d) => {
            setOpen(false);
            if (d) onChange(d);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(28,28,28,0.35)" },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground, marginBottom: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  optionText: { fontSize: 16, color: colors.foreground },
  optionSelected: { color: colors.accent, fontWeight: "700" },
  optionSub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  iosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    minHeight: 52,
  },
  iosLabel: { fontSize: 15, fontWeight: "500", color: colors.foreground },
});
