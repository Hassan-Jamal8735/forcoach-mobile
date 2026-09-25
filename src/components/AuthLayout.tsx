import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BrandLogo } from "./BrandLogo";
import { colors } from "../theme/colors";

export function AuthLayout({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.foreground} />
          </TouchableOpacity>
        ) : null}
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <BrandLogo size="sm" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { height: 44, justifyContent: "center", paddingHorizontal: 20 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
  logo: { alignItems: "center", marginTop: 8, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "500", color: colors.foreground, letterSpacing: -0.6 },
  subtitle: { fontSize: 16, color: colors.mutedForeground, marginTop: 8, marginBottom: 28, lineHeight: 23 },
  divider: { flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 22 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: { fontSize: 14, color: colors.mutedForeground },
});
