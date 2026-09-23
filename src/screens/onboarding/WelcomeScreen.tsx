import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { Button } from "../../components/ui";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

const POINTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: "business-outline", text: "Add the studios you teach at" },
  { icon: "sync-outline", text: "Sync your schedule automatically" },
  { icon: "wallet-outline", text: "Track earnings and send invoices" },
];

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.top}>
        <Image source={require("../../../assets/brand-mark.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.wordmark}>FORCOACH</Text>
        <Text style={styles.tagline}>MANAGE · GROW · INSPIRE</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.title}>Let's set up your account</Text>
        <Text style={styles.subtitle}>A few quick steps and you're ready to go.</Text>
        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p.text} style={styles.point}>
              <View style={styles.pointIcon}>
                <Ionicons name={p.icon} size={18} color={colors.accent} />
              </View>
              <Text style={styles.pointText}>{p.text}</Text>
            </View>
          ))}
        </View>
        <Button title="Get started" icon="arrow-forward" variant="dark" onPress={() => navigation.navigate("AddStudios")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  top: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 132, height: 97, marginBottom: 20 },
  wordmark: { fontSize: 24, fontWeight: "800", letterSpacing: 4, color: colors.foreground },
  tagline: { fontSize: 11, letterSpacing: 2, color: colors.mutedForeground, marginTop: 6 },
  bottom: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 30, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.mutedForeground, marginTop: 8 },
  points: { gap: 12, marginVertical: 24 },
  point: { flexDirection: "row", alignItems: "center", gap: 12 },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  pointText: { fontSize: 15, color: colors.foreground, fontWeight: "500" },
});
