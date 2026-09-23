import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingHeader } from "./OnboardingHeader";
import { colors } from "../theme/colors";

export function OnboardingLayout({
  step,
  onBack,
  title,
  subtitle,
  children,
  footer,
}: {
  step: number;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <OnboardingHeader step={step} onBack={onBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.mutedForeground, marginTop: 8, marginBottom: 24, lineHeight: 21 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
});
