import { apiFetch } from "./client";

/** Permanently deletes the signed-in account and everything stored for it. */
export function deleteAccount() {
  return apiFetch<{ deleted: true }>("/account", { method: "DELETE" });
}
