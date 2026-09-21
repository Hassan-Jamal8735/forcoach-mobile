import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function PlaceholderScreen({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.subtitle}>Coming in the next milestone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 6, color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.mutedForeground },
});
