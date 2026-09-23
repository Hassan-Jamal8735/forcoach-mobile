import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingHeader } from "../../components/OnboardingHeader";
import { useOnboarding } from "../../context/OnboardingContext";
import { createStudio, deleteStudio } from "../../lib/api/studios";
import { colors, cardShadow } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "AddStudios">;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function AddStudiosScreen({ navigation }: Props) {
  const { studios, addStudio, removeStudio } = useOnboarding();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    try {
      const studio = await createStudio({ name: trimmed, compensationType: "per_class" });
      addStudio(studio);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this studio");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    removeStudio(id);
    try {
      await deleteStudio(id);
    } catch {
      // Not fatal at onboarding time — worst case it's cleaned up later from Settings.
    }
  }

  return (
    <View style={styles.container}>
      <OnboardingHeader step={1} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Add your studio(s)</Text>
        <Text style={styles.subtitle}>
          Start by adding the studios you teach at. You can add more later.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Search for a studio name"
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            disabled={adding || !name.trim()}
          >
            {adding ? (
              <ActivityIndicator color={colors.accentForeground} size="small" />
            ) : (
              <Text style={styles.addBtnText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}

        {studios.length > 0 && (
          <>
            <Text style={styles.listLabel}>Your studios</Text>
            <FlatList
              data={studios}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.studioRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(item.name)}</Text>
                  </View>
                  <Text style={styles.studioName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemove(item.id)} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => navigation.navigate("ConnectPlatforms")}
      >
        <Text style={styles.nextBtnText}>Next  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 20 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: colors.card,
  },
  addBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: colors.offWhite, fontWeight: "600" },
  error: { color: colors.destructiveText, fontSize: 13, marginTop: 8 },
  listLabel: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, marginTop: 24, marginBottom: 8 },
  studioRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
    ...cardShadow,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "700", color: colors.accent },
  studioName: { flex: 1, fontSize: 15, color: colors.foreground },
  nextBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  nextBtnText: { color: colors.offWhite, fontSize: 16, fontWeight: "600" },
});
