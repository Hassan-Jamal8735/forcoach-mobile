import type { Event } from "../lib/api/events";

export type CalendarStackParamList = {
  CalendarList: undefined;
  EventForm: { event?: Event };
};

export type RootTabParamList = {
  Calendar: undefined;
  Earnings: undefined;
  Invoices: undefined;
  Studios: undefined;
  Settings: undefined;
};
