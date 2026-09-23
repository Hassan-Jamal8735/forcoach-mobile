import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "../../navigation/onboarding-types";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";
import { createStudio, deleteStudio } from "../../lib/api/studios";
import { Avatar, Banner, Button, Card, Field, ListRow, SectionLabel, initials } from "../../components/ui";
import { colors, studioColor } from "../../theme/colors";

type Props = NativeStackScreenProps<OnboardingStackParamList, "AddStudios">;

export function AddStudiosScreen({ navigation }: Props) {
  const { studios, addStudio, removeStudio } = useOnboarding();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (studios.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("You've already added that studio.");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      addStudio(await createStudio({ name: trimmed, compensationType: "per_class", compensationValue: 0 }));
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add this studio");
    } finally {
      setAdding(false);
    }
  }

  function handleRemove(id: string) {
    removeStudio(id);
    deleteStudio(id).catch(() => {});
  }

  return (
    <OnboardingLayout
      step={1}
      onBack={() => navigation.goBack()}
      title="Add your studio(s)"
      subtitle="Start with the studios you teach at. You can add more later."
      footer={
        <Button
          title={studios.length ? "Next" : "Skip for now"}
          icon="arrow-forward"
          variant={studios.length ? "dark" : "secondary"}
          onPress={() => navigation.navigate("ConnectPlatforms")}
        />
      }
    >
      {error && <Banner message={error} />}
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}>
          <Field
            value={name}
            onChangeText={setName}
            placeholder="Studio name"
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity style={[styles.addBtn, (!name.trim() || adding) && { opacity: 0.4 }]} onPress={handleAdd} disabled={!name.trim() || adding}>
          <Ionicons name="add" size={24} color={colors.accentForeground} />
        </TouchableOpacity>
      </View>

      {studios.length > 0 && (
        <>
          <SectionLabel>Your studios</SectionLabel>
          <Card padded={false}>
            {studios.map((s, i) => (
              <ListRow
                key={s.id}
                left={<Avatar label={initials(s.name)} color={studioColor(s.id)} size={36} />}
                label={s.name}
                last={i === studios.length - 1}
                right={
                  <TouchableOpacity onPress={() => handleRemove(s.id)} hitSlop={10}>
                    <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                }
              />
            ))}
          </Card>
        </>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
