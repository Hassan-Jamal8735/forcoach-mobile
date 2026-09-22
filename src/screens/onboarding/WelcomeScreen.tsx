import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Image
          source={require("../../../assets/brand-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>FORCOACH</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.title}>Let's set up your account</Text>
        <Text style={styles.subtitle}>
          A few quick steps to personalize your experience.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AddStudios")}
        >
          <Text style={styles.buttonText}>Get started  →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "space-between" },
  top: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 72, height: 72, marginBottom: 8 },
  wordmark: { fontSize: 22, fontWeight: "700", letterSpacing: 1, color: colors.foreground },
  bottom: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 24 },
  button: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
});
