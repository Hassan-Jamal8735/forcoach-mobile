import { apiFetch } from "./client";

export type Plan = "monthly" | "yearly";

export type BillingStatus = {
  status:
    | "none"
    | "incomplete"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: Plan | null;
  enforced: boolean;
  hasAccess: boolean;
};

export function getBillingStatus() {
  return apiFetch<BillingStatus>("/billing/status");
}

// Emails the coach how to choose a plan on the website (throttled server-side).
export function sendPlanInfoEmail() {
  return apiFetch<{ sent: boolean }>("/billing/plan-info-email", { method: "POST" });
}
