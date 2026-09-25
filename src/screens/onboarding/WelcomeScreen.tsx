import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { Button } from "../../components/ui";
import { BrandLogo } from "../../components/BrandLogo";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.top}>
        <BrandLogo size="lg" />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.title}>Let's get you{"\n"}set up</Text>
        <Text style={styles.subtitle}>A few quick steps to personalize your experience.</Text>
        <Button title="Start" variant="dark" trailingIcon="arrow-forward" onPress={() => navigation.navigate("AddStudios")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  top: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
  bottom: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 40, fontWeight: "500", color: colors.foreground, letterSpacing: -0.8, lineHeight: 46 },
  subtitle: { fontSize: 17, color: colors.mutedForeground, marginTop: 12, marginBottom: 32, lineHeight: 24 },
});
