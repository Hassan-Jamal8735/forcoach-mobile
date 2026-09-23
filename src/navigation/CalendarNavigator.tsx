import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { CalendarStackParamList } from "./types";
import { CalendarScreen } from "../screens/CalendarScreen";
import { EventFormScreen } from "../screens/EventFormScreen";
import { stackScreenOptions } from "../theme/navigation";

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export function CalendarNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CalendarList" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventForm" component={EventFormScreen} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}
