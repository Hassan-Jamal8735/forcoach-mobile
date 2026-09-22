import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

export function DoneScreen() {
  const { currency } = useOnboarding();
  const [finishing, setFinishing] = useState(false);
  const [notificationsChoiceMade, setNotificationsChoiceMade] = useState(false);

  async function finishOnboarding() {
    setFinishing(true);
    try {
      await supabase.auth.updateUser({
        data: { currency, mobile_onboarding_completed: true },
      });
    } finally {
      setFinishing(false);
    }
  }

  if (!notificationsChoiceMade) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Your studios are connected and your account is ready.
          </Text>
        </View>

        <View style={styles.notifyCard}>
          <Text style={styles.notifyTitle}>Take FORCOACH with you</Text>
          <Text style={styles.notifySubtitle}>
            Get the most out of the app with notifications for your upcoming classes.
          </Text>
          <TouchableOpacity
            style={styles.enableBtn}
            onPress={() => setNotificationsChoiceMade(true)}
          >
            <Text style={styles.enableBtnText}>Enable notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNotificationsChoiceMade(true)}>
            <Text style={styles.maybeLater}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Your studios are connected and your account is ready.
        </Text>
      </View>

      <TouchableOpacity style={styles.goBtn} onPress={finishOnboarding} disabled={finishing}>
        {finishing ? (
          <ActivityIndicator color={colors.offWhite} />
        ) : (
          <Text style={styles.goBtnText}>Go to my schedule  →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "space-between" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  checkMark: { fontSize: 32, color: colors.accent, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginTop: 8 },
  goBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  goBtnText: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
  notifyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  notifyTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  notifySubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  enableBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 10,
  },
  enableBtnText: { color: colors.offWhite, fontWeight: "600", fontSize: 14 },
  maybeLater: { color: colors.mutedForeground, fontSize: 13 },
});
