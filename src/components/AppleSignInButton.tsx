import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../lib/supabase";
import { Banner } from "./ui";

/** Apple's own sign-in button. Renders nothing on Android or unsupported devices. */
export function AppleSignInButton() {
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  if (!available) return null;

  async function handlePress() {
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError("Apple sign-in didn't complete. Please try again.");
        return;
      }
      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      // Apple only shares the name on the very first sign-in, so keep it then.
      const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ");
      if (name && !data.user?.user_metadata?.full_name) {
        await supabase.auth.updateUser({
          data: { full_name: name, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        });
      }
    } catch (e) {
      // The coach closing Apple's sheet is not an error.
      if ((e as { code?: string }).code === "ERR_REQUEST_CANCELED") return;
      setError(e instanceof Error ? e.message : "Apple sign-in failed. Please try again.");
    }
  }

  return (
    <View style={{ marginTop: 12 }}>
      {error && <Banner message={error} />}
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={14}
        style={{ height: 52 }}
        onPress={handlePress}
      />
    </View>
  );
}
