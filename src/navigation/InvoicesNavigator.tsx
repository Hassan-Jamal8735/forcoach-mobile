import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { InvoicesStackParamList } from "./invoices-types";
import { InvoicesListScreen } from "../screens/invoices/InvoicesListScreen";
import { CreateInvoiceScreen } from "../screens/invoices/CreateInvoiceScreen";
import { InvoiceDetailScreen } from "../screens/invoices/InvoiceDetailScreen";
import { stackScreenOptions } from "../theme/navigation";

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="InvoicesList" component={InvoicesListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={{ title: "New invoice", presentation: "modal" }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "Invoice" }} />
    </Stack.Navigator>
  );
}
