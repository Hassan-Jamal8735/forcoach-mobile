import { Alert } from "react-native";
import { deleteAccount } from "./api/account";

/**
 * Two-step confirmation, then permanent deletion and sign-out. Shared by
 * Settings and the no-plan screen: Apple requires that any account created
 * in the app can also be deleted in the app, with or without a plan.
 */
export function confirmDeleteAccount(signOut: () => Promise<void> | void) {
  Alert.alert(
    "Delete your account?",
    "This permanently deletes your account, studios, classes and invoices, and cancels any active plan. It can't be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete account",
        style: "destructive",
        onPress: () =>
          Alert.alert("Are you sure?", "Your data will be deleted for good.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete forever",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteAccount();
                  await signOut();
                } catch (e) {
                  Alert.alert("Couldn't delete your account", e instanceof Error ? e.message : "Please try again or contact support.");
                }
              },
            },
          ]),
      },
    ],
  );
}
