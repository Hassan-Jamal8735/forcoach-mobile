import { apiFetch } from "./client";

export type EventStatus = "assigned" | "unassigned" | "excluded";

export type Event = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  source: "google_calendar" | "csv" | "manual" | "ics";
  studio_id: string | null;
  status: EventStatus;
  notes: string | null;
  rate_override: number | null;
  attendance_count: number | null;
  created_at: string;
  updated_at: string;
};

export type EventInput = {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  source?: "google_calendar" | "csv" | "manual";
  studioId?: string | null;
  status?: EventStatus;
  notes?: string;
  rateOverride?: number | null;
  attendanceCount?: number | null;
};

export function listEvents() {
  return apiFetch<Event[]>("/events");
}

export function createEvent(input: EventInput) {
  return apiFetch<Event>("/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEvent(id: string, input: Partial<EventInput>) {
  return apiFetch<Event>(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteEvent(id: string) {
  return apiFetch<void>(`/events/${id}`, { method: "DELETE" });
}
