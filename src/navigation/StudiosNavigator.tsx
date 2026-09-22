import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { StudiosStackParamList } from "./studios-types";
import { StudiosListScreen } from "../screens/studios/StudiosListScreen";
import { StudioFormScreen } from "../screens/studios/StudioFormScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<StudiosStackParamList>();

export function StudiosNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.charcoal },
        headerTintColor: colors.offWhite,
        headerTitleStyle: { color: colors.offWhite },
      }}
    >
      <Stack.Screen
        name="StudiosList"
        component={StudiosListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="StudioForm" component={StudioFormScreen} />
    </Stack.Navigator>
  );
}
