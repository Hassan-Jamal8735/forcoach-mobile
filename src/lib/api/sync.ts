import { apiFetch } from "./client";

export type IcsFeed = {
  id: string;
  url: string;
  name: string;
  default_studio_id: string | null;
  last_synced_at: string | null;
  created_at: string;
};

export type SyncResult = { created: number; updated: number };

export type GoogleCalendarStatus =
  | { connected: false }
  | {
      connected: true;
      calendarId: string | null;
      calendarName: string | null;
      googleAccountEmail: string | null;
      lastSyncedAt: string | null;
      defaultStudioId: string | null;
    };

export type GoogleCalendarOption = { id: string; name: string; primary: boolean };

export const listIcsFeeds = () => apiFetch<IcsFeed[]>("/ics-feeds");

export const createIcsFeed = (url: string, name: string, defaultStudioId?: string | null) =>
  apiFetch<IcsFeed>("/ics-feeds", {
    method: "POST",
    body: JSON.stringify({ url, name, ...(defaultStudioId ? { defaultStudioId } : {}) }),
  });

export const syncIcsFeed = (id: string) => apiFetch<SyncResult>(`/ics-feeds/${id}/sync`, { method: "POST" });

export const deleteIcsFeed = (id: string) => apiFetch<void>(`/ics-feeds/${id}`, { method: "DELETE" });

export const getGoogleStatus = () => apiFetch<GoogleCalendarStatus>("/calendar/google/status");

export const getGoogleConnectUrl = () => apiFetch<{ url: string }>("/auth/google/connect");

export const listGoogleCalendars = () => apiFetch<GoogleCalendarOption[]>("/calendar/google/calendars");

export const selectGoogleCalendar = (calendarId: string, calendarName: string) =>
  apiFetch<void>("/calendar/google/select-calendar", { method: "POST", body: JSON.stringify({ calendarId, calendarName }) });

export const syncGoogleCalendar = () => apiFetch<SyncResult>("/calendar/google/sync", { method: "POST" });

export const disconnectGoogleCalendar = () => apiFetch<void>("/calendar/google/disconnect", { method: "DELETE" });
