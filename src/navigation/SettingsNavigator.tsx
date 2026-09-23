import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "./settings-types";
import { SettingsMenuScreen } from "../screens/settings/SettingsMenuScreen";
import { ProfileScreen } from "../screens/settings/ProfileScreen";
import { ChangePasswordScreen } from "../screens/settings/ChangePasswordScreen";
import { SubscriptionScreen } from "../screens/settings/SubscriptionScreen";
import { PaymentDetailsScreen } from "../screens/settings/PaymentDetailsScreen";
import { CurrencyScreen } from "../screens/settings/CurrencyScreen";
import { NotificationsScreen } from "../screens/settings/NotificationsScreen";
import { CalendarSyncScreen } from "../screens/settings/CalendarSyncScreen";
import { SupportScreen } from "../screens/settings/SupportScreen";
import { StudiosListScreen } from "../screens/studios/StudiosListScreen";
import { StudioFormScreen } from "../screens/studios/StudioFormScreen";
import { stackScreenOptions } from "../theme/navigation";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SettingsMenu" component={SettingsMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change password" }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: "Subscription" }} />
      <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} options={{ title: "Payment details" }} />
      <Stack.Screen name="Currency" component={CurrencyScreen} options={{ title: "Currency" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="StudiosList" component={StudiosListScreen} options={{ title: "Studios" }} />
      <Stack.Screen name="StudioForm" component={StudioFormScreen} options={{ presentation: "modal" }} />
      <Stack.Screen name="CalendarSync" component={CalendarSyncScreen} options={{ title: "Calendar sync" }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: "Support" }} />
    </Stack.Navigator>
  );
}
