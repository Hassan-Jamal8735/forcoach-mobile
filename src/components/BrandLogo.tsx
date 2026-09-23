import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const SIZES = {
  sm: { mark: 72, word: 18, tag: 9, spacing: 3 },
  md: { mark: 104, word: 21, tag: 10, spacing: 3.5 },
  lg: { mark: 132, word: 24, tag: 11, spacing: 4 },
};

/** FC mark + FORCOACH wordmark + tagline — the one brand lockup used app-wide. */
export function BrandLogo({ size = "md", tagline = true }: { size?: keyof typeof SIZES; tagline?: boolean }) {
  const s = SIZES[size];
  return (
    <View style={styles.wrap}>
      <Image
        source={require("../../assets/brand-mark.png")}
        style={{ width: s.mark, height: s.mark * 0.733, marginBottom: s.mark * 0.15 }}
        resizeMode="contain"
      />
      <Text style={[styles.word, { fontSize: s.word, letterSpacing: s.spacing }]}>FORCOACH</Text>
      {tagline && <Text style={[styles.tag, { fontSize: s.tag }]}>MANAGE · GROW · INSPIRE</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  word: { fontWeight: "800", color: colors.foreground },
  tag: { letterSpacing: 2, color: colors.mutedForeground, marginTop: 6 },
});
