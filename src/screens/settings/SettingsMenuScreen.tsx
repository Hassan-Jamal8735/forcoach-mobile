import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "../../navigation/settings-types";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Avatar, Card, ListRow, Screen, ScreenHeader, SectionLabel, initials } from "../../components/ui";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsMenu">;

const CURRENCY_LABEL: Record<string, string> = { EUR: "Euro (€)", USD: "US Dollar ($)", GBP: "Pound (£)" };

export function SettingsMenuScreen({ navigation }: Props) {
  const { session, signOut } = useAuth();
  const metadata = (session?.user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = (metadata.full_name as string | undefined) || "Coach";
  const currency = (metadata.currency as string | undefined) ?? "EUR";

  function handleLogOut() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: signOut },
    ]);
  }

  function handleRerunSetup() {
    Alert.alert("Run setup again", "Walk through the setup steps again? Your existing data stays as it is.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Start",
        onPress: () => supabase.auth.updateUser({ data: { mobile_onboarding_completed: false } }),
      },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader title="Settings" />

      <Card style={styles.profileCard}>
        <Avatar label={initials(fullName)} color={colors.accent} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
        </View>
      </Card>

      <SectionLabel>Account</SectionLabel>
      <Card padded={false}>
        <ListRow icon="person-outline" label="Profile" onPress={() => navigation.navigate("Profile")} />
        <ListRow icon="lock-closed-outline" label="Change password" onPress={() => navigation.navigate("ChangePassword")} />
        <ListRow icon="sparkles-outline" label="Subscription" onPress={() => navigation.navigate("Subscription")} last />
      </Card>

      <SectionLabel>Business</SectionLabel>
      <Card padded={false}>
        <ListRow icon="business-outline" label="Studios" onPress={() => navigation.navigate("StudiosList")} />
        <ListRow icon="sync-outline" label="Calendar sync & integrations" onPress={() => navigation.navigate("CalendarSync")} />
        <ListRow icon="card-outline" label="Payment details" onPress={() => navigation.navigate("PaymentDetails")} />
        <ListRow
          icon="cash-outline"
          label="Currency"
          value={CURRENCY_LABEL[currency] ?? currency}
          onPress={() => navigation.navigate("Currency")}
          last
        />
      </Card>

      <SectionLabel>App</SectionLabel>
      <Card padded={false}>
        <ListRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate("Notifications")} />
        <ListRow icon="refresh-outline" label="Run setup again" onPress={handleRerunSetup} last />
      </Card>

      <SectionLabel>Help</SectionLabel>
      <Card padded={false}>
        <ListRow icon="chatbubbles-outline" label="Contact support" onPress={() => navigation.navigate("Support")} />
        <ListRow icon="book-outline" label="Help center" onPress={() => Linking.openURL("https://forcoach.io/guide")} />
        <ListRow icon="document-text-outline" label="Terms of service" onPress={() => Linking.openURL("https://forcoach.io/terms")} />
        <ListRow icon="shield-checkmark-outline" label="Privacy policy" onPress={() => Linking.openURL("https://forcoach.io/privacy")} last />
      </Card>

      <Card padded={false} style={{ marginTop: 20 }}>
        <ListRow icon="log-out-outline" label="Log out" destructive onPress={handleLogOut} last />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  name: { fontSize: 17, fontWeight: "700", color: colors.foreground },
  email: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
});
