import { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { ConnectFeedSheet, PLATFORMS, PlatformBadge, type PlatformKey } from "../../components/ConnectFeedSheet";
import { useOnboarding } from "../../context/OnboardingContext";
import { getGoogleConnectUrl } from "../../lib/api/sync";
import { runReturnFlow } from "../../lib/return-flow";
import { Banner, Button, Card, ListRow } from "../../components/ui";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "ConnectPlatforms">;

export function ConnectPlatformsScreen({ navigation }: Props) {
  const { studios } = useOnboarding();
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectGoogle() {
    setGoogleBusy(true);
    setError(null);
    try {
      const result = await runReturnFlow((returnTo) => getGoogleConnectUrl(returnTo));
      if (result?.google === "connected") setConnected((c) => [...c, "google"]);
      else if (result) setError("Google Calendar couldn't be connected. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect Google Calendar");
    } finally {
      setGoogleBusy(false);
    }
  }

  const done = (key: string) =>
    connected.includes(key) ? <Ionicons name="checkmark-circle" size={22} color={colors.success} /> : <Text style={{ color: colors.accent, fontWeight: "700" }}>Connect</Text>;

  return (
    <OnboardingLayout
      step={2}
      onBack={() => navigation.goBack()}
      title="Connect your platforms"
      subtitle="Sync your schedule automatically from the platforms your studios use."
      footer={
        connected.length ? (
          <Button title="Next" icon="arrow-forward" variant="dark" onPress={() => navigation.navigate("SetRates")} />
        ) : (
          <Button title="I'll do this later" variant="secondary" onPress={() => navigation.navigate("SetRates")} />
        )
      }
    >
      {error && <Banner message={error} />}
      <Card padded={false}>
        {PLATFORMS.map((p) => (
          <ListRow
            key={p.key}
            left={<PlatformBadge platform={p} size={36} />}
            label={p.label}
            onPress={() => setConnecting(p.key)}
            right={done(p.key)}
          />
        ))}
        <ListRow
          left={
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="logo-google" size={18} color="#4285F4" />
            </View>
          }
          label="Google Calendar"
          onPress={connectGoogle}
          last
          right={googleBusy ? <Text style={{ color: colors.mutedForeground }}>…</Text> : done("google")}
        />
      </Card>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, lineHeight: 17 }}>
        FORCOACH only reads your teaching schedule. We never ask for your platform passwords.
      </Text>

      <ConnectFeedSheet
        platformKey={connecting}
        studios={studios}
        onClose={() => setConnecting(null)}
        onConnected={() => {
          if (connecting) setConnected((c) => [...c, connecting]);
          setConnecting(null);
        }}
      />
    </OnboardingLayout>
  );
}
