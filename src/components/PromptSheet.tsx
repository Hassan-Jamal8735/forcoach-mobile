import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Field } from "./ui";
import { colors } from "../theme/colors";

/** Small cross-platform single-value editor (Alert.prompt is iOS-only). */
export function PromptSheet({
  visible,
  title,
  subtitle,
  initialValue,
  label,
  keyboardType = "default",
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialValue: string;
  label?: string;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  onCancel: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Field label={label} value={value} onChangeText={setValue} keyboardType={keyboardType} autoFocus selectTextOnFocus />
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button title="Save" onPress={() => onSubmit(value)} style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "rgba(28,28,28,0.4)", justifyContent: "center", padding: 24 },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 20 },
  title: { fontSize: 18, fontWeight: "800", color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, marginBottom: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
});
