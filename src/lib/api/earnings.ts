import { apiFetch } from "./client";

export type StudioBreakdown = {
  studioId: string;
  studioName: string;
  hours: number;
  earnings: number;
  classCount: number;
};

export type EarningsSummary = {
  from: string;
  to: string;
  totalHours: number;
  totalEarnings: number;
  classCount: number;
  avgClassRate: number;
  bestStudio: string | null;
  pendingCount: number;
  pendingAttendanceCount: number;
  studioBreakdown: StudioBreakdown[];
};

export type TimeseriesPoint = { bucket: string; earnings: number; hours: number };

export function getEarningsSummary(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return apiFetch<EarningsSummary>(`/earnings/summary?${params.toString()}`);
}

export function getEarningsTimeseries(
  from: string,
  to: string,
  granularity: "day" | "week" | "month" = "week",
) {
  const params = new URLSearchParams({ from, to, granularity });
  return apiFetch<{ granularity: string; points: TimeseriesPoint[] }>(
    `/earnings/timeseries?${params.toString()}`,
  );
}
