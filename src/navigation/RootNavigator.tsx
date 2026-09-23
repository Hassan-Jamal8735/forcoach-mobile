import { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RootTabParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { CalendarNavigator } from "./CalendarNavigator";
import { EarningsScreen } from "../screens/EarningsScreen";
import { InvoicesNavigator } from "./InvoicesNavigator";
import { StudiosNavigator } from "./StudiosNavigator";
import { SettingsNavigator } from "./SettingsNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { supabase } from "../lib/supabase";
import { listStudios } from "../lib/api/studios";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Calendar: "calendar-outline",
  Earnings: "stats-chart-outline",
  Invoices: "receipt-outline",
  Studios: "business-outline",
  Settings: "settings-outline",
};

const TAB_ICONS_FOCUSED: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Calendar: "calendar",
  Earnings: "stats-chart",
  Invoices: "receipt",
  Studios: "business",
  Settings: "settings",
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.card,
    text: colors.foreground,
    border: colors.border,
  },
};

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={
              focused
                ? TAB_ICONS_FOCUSED[route.name as keyof RootTabParamList]
                : TAB_ICONS[route.name as keyof RootTabParamList]
            }
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Calendar" component={CalendarNavigator} options={{ title: "Schedule" }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Invoices" component={InvoicesNavigator} />
      <Tab.Screen name="Studios" component={StudiosNavigator} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}

function Loading() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function RootNavigator() {
  const { session, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setNeedsOnboarding(null);
      return;
    }

    if (session.user.user_metadata?.mobile_onboarding_completed) {
      setNeedsOnboarding(false);
      return;
    }

    setNeedsOnboarding(null);
    listStudios()
      .then((studios) => {
        if (studios.length > 0) {
          // Existing web coach opening the app for the first time — they've
          // already set things up, so don't force them through the wizard.
          supabase.auth
            .updateUser({ data: { mobile_onboarding_completed: true } })
            .catch(() => {});
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(true);
        }
      })
      .catch(() => setNeedsOnboarding(false));
  }, [session]);

  if (loading) return <Loading />;

  if (!session) {
    return (
      <NavigationContainer theme={navigationTheme}>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (needsOnboarding === null) return <Loading />;

  return (
    <NavigationContainer theme={navigationTheme}>
      {needsOnboarding ? <OnboardingNavigator /> : <AppTabs />}
    </NavigationContainer>
  );
}
