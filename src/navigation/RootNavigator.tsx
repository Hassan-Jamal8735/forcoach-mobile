import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import type { RootTabParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { CalendarNavigator } from "./CalendarNavigator";
import { PlaceholderScreen } from "../screens/PlaceholderScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Calendar" component={CalendarNavigator} />
      <Tab.Screen name="Earnings">
        {() => <PlaceholderScreen label="Earnings" />}
      </Tab.Screen>
      <Tab.Screen name="Invoices">
        {() => <PlaceholderScreen label="Invoices" />}
      </Tab.Screen>
      <Tab.Screen name="Studios">
        {() => <PlaceholderScreen label="Studios" />}
      </Tab.Screen>
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>{session ? <AppTabs /> : <LoginScreen />}</NavigationContainer>
  );
}
