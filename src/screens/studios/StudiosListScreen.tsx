import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "../../navigation/settings-types";
import { listStudios, type Studio } from "../../lib/api/studios";
import { useCurrency } from "../../lib/currency";
import { Avatar, Badge, Banner, Button, Card, EmptyState, ListRow, Loading, StackScreen, initials } from "../../components/ui";
import { colors, studioColor } from "../../theme/colors";

type Props = NativeStackScreenProps<SettingsStackParamList, "StudiosList">;

export function StudiosListScreen({ navigation }: Props) {
  const { symbol } = useCurrency();
  const [studios, setStudios] = useState<Studio[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setStudios(await listStudios());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load studios");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function rateLabel(s: Studio) {
    if (s.compensation_type === "tiered") return "Tiered by attendance";
    if (s.compensation_value == null) return "No rate set";
    return `${symbol}${s.compensation_value} ${s.compensation_type === "hourly" ? "per hour" : "per class"}`;
  }

  if (!studios && !error) return <Loading />;

  const addButton = <Button title="Add studio" icon="add" onPress={() => navigation.navigate("StudioForm", {})} />;

  return (
    <StackScreen
      footer={studios && studios.length > 0 ? addButton : undefined}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}
    >
      {error && <Banner message={error} />}
      {studios && studios.length === 0 ? (
        <EmptyState
          icon="business-outline"
          title="No studios yet"
          subtitle="Add the studios you teach at and how each one pays you."
          action={addButton}
        />
      ) : (
        <Card padded={false}>
          {studios?.map((s, i) => (
            <ListRow
              key={s.id}
              left={<Avatar label={initials(s.name)} color={studioColor(s.id)} size={38} />}
              label={s.name}
              onPress={() => navigation.navigate("StudioForm", { studio: s })}
              last={i === studios.length - 1}
              right={
                <View style={styles.right}>
                  {s.status === "inactive" ? <Badge label="Inactive" /> : <Text style={styles.rate}>{rateLabel(s)}</Text>}
                </View>
              }
            />
          ))}
        </Card>
      )}
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  right: { alignItems: "flex-end" },
  rate: { fontSize: 13, color: colors.mutedForeground },
});
