import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { CalendarStackParamList } from "./types";
import { CalendarScreen } from "../screens/CalendarScreen";
import { EventFormScreen } from "../screens/EventFormScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export function CalendarNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.charcoal },
        headerTintColor: colors.offWhite,
        headerTitleStyle: { color: colors.offWhite },
      }}
    >
      <Stack.Screen
        name="CalendarList"
        component={CalendarScreen}
        options={{ title: "Schedule" }}
      />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
    </Stack.Navigator>
  );
}
