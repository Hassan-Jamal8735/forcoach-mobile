import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "./onboarding-types";
import { OnboardingProvider } from "../context/OnboardingContext";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { AddStudiosScreen } from "../screens/onboarding/AddStudiosScreen";
import { ConnectPlatformsScreen } from "../screens/onboarding/ConnectPlatformsScreen";
import { SetRatesScreen } from "../screens/onboarding/SetRatesScreen";
import { ChooseCurrencyScreen } from "../screens/onboarding/ChooseCurrencyScreen";
import { ChoosePlanScreen } from "../screens/onboarding/ChoosePlanScreen";
import { DoneScreen } from "../screens/onboarding/DoneScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="AddStudios" component={AddStudiosScreen} />
        <Stack.Screen name="ConnectPlatforms" component={ConnectPlatformsScreen} />
        <Stack.Screen name="SetRates" component={SetRatesScreen} />
        <Stack.Screen name="ChooseCurrency" component={ChooseCurrencyScreen} />
        <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
        <Stack.Screen name="Done" component={DoneScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
