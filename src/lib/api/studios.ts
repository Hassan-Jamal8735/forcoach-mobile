import { apiFetch } from "./client";

export type CompensationType = "hourly" | "per_class" | "tiered";

export type Studio = {
  id: string;
  user_id: string;
  name: string;
  reference_id: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  compensation_type: CompensationType;
  compensation_value: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type StudioInput = {
  name: string;
  compensationType: CompensationType;
  compensationValue?: number;
  status?: "active" | "inactive";
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  referenceId?: string;
};

export function listStudios() {
  return apiFetch<Studio[]>("/studios");
}

export function createStudio(input: StudioInput) {
  return apiFetch<Studio>("/studios", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStudio(id: string, input: Partial<StudioInput>) {
  return apiFetch<Studio>(`/studios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteStudio(id: string) {
  return apiFetch<void>(`/studios/${id}`, { method: "DELETE" });
}
