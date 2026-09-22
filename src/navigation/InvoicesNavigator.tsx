import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "./invoices-types";
import { InvoicesListScreen } from "../screens/invoices/InvoicesListScreen";
import { CreateInvoiceScreen } from "../screens/invoices/CreateInvoiceScreen";
import { InvoiceDetailScreen } from "../screens/invoices/InvoiceDetailScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.charcoal },
        headerTintColor: colors.offWhite,
        headerTitleStyle: { color: colors.offWhite },
      }}
    >
      <Stack.Screen
        name="InvoicesList"
        component={InvoicesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{ title: "Create invoice" }}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetailScreen}
        options={{ title: "Invoice" }}
      />
    </Stack.Navigator>
  );
}
