import { apiFetch } from "./client";

export type Studio = {
  id: string;
  user_id: string;
  name: string;
  compensation_type: "hourly" | "per_class" | "tiered";
  compensation_value: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export function listStudios() {
  return apiFetch<Studio[]>("/studios");
}
