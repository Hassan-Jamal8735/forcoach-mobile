import { StyleSheet, Text, View } from "react-native";

export function PlaceholderScreen({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.subtitle}>Coming in the next milestone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#6b7280" },
});
