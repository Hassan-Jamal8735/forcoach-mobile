import type { Event } from "../lib/api/events";

export type CalendarStackParamList = {
  CalendarList: undefined;
  EventForm: { event?: Event; date?: string };
};

export type RootTabParamList = {
  Calendar: undefined;
  Earnings: undefined;
  Invoices: undefined;
  Settings: undefined;
};
