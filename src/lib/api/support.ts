import { apiFetch } from "./client";

export type SupportMessage = {
  id: string;
  sender: "user" | "admin";
  body: string;
  read_at: string | null;
  created_at: string;
};

export const listSupportMessages = () => apiFetch<SupportMessage[]>("/support/messages");

export const sendSupportMessage = (body: string) =>
  apiFetch<SupportMessage>("/support/messages", { method: "POST", body: JSON.stringify({ body }) });

export const markSupportRead = () => apiFetch<void>("/support/messages/read", { method: "POST" });
