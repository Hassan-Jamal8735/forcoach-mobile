import type { Studio } from "../lib/api/studios";

export type SettingsStackParamList = {
  SettingsMenu: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Subscription: undefined;
  PaymentDetails: undefined;
  Currency: undefined;
  Notifications: undefined;
  StudiosList: undefined;
  StudioForm: { studio?: Studio };
  CalendarSync: undefined;
  Support: undefined;
};
