import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "./settings-types";
import { SettingsMenuScreen } from "../screens/settings/SettingsMenuScreen";
import { ProfileScreen } from "../screens/settings/ProfileScreen";
import { PaymentDetailsScreen } from "../screens/settings/PaymentDetailsScreen";
import { NotificationsScreen } from "../screens/settings/NotificationsScreen";
import { CurrencyScreen } from "../screens/settings/CurrencyScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.charcoal },
        headerTintColor: colors.offWhite,
        headerTitleStyle: { color: colors.offWhite },
      }}
    >
      <Stack.Screen
        name="SettingsMenu"
        component={SettingsMenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen
        name="PaymentDetails"
        component={PaymentDetailsScreen}
        options={{ title: "Payment details" }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <Stack.Screen name="Currency" component={CurrencyScreen} options={{ title: "Currency" }} />
    </Stack.Navigator>
  );
}
