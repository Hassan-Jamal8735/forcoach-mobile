import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

// Cloudflare Turnstile, hosted on forcoach.io (the widget only runs on its
// registered hostname) and bridged back here. Supabase auth verifies the token.
// Tokens are single-use: change `resetKey` after each request to get a new one.
export function Captcha({ onToken, resetKey }: { onToken: (token: string | null) => void; resetKey?: number }) {
  return (
    <View style={styles.box}>
      <WebView
        key={resetKey}
        source={{ uri: "https://forcoach.io/mobile-captcha" }}
        style={styles.webview}
        scrollEnabled={false}
        onLoadStart={() => onToken(null)}
        onMessage={(e) => {
          try {
            const { token } = JSON.parse(e.nativeEvent.data) as { token: string | null };
            onToken(token);
          } catch {
            onToken(null);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 72, marginVertical: 8, overflow: "hidden" },
  webview: { backgroundColor: "transparent" },
});
