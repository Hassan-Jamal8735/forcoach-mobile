import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { CalendarStackParamList } from "./types";
import { CalendarScreen } from "../screens/CalendarScreen";
import { EventFormScreen } from "../screens/EventFormScreen";

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export function CalendarNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CalendarList"
        component={CalendarScreen}
        options={{ title: "Calendar" }}
      />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
    </Stack.Navigator>
  );
}
