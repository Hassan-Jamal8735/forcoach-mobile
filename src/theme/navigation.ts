import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors } from "./colors";

// One light, flat header style for every pushed screen so the whole app reads
// as a single design rather than a mix of dark bars and custom titles.
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.foreground,
  headerTitleStyle: { fontWeight: "700", fontSize: 17, color: colors.foreground },
  headerBackButtonDisplayMode: "minimal",
  contentStyle: { backgroundColor: colors.background },
};
