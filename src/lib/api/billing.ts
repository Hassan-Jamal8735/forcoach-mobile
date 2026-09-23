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

export function createCheckoutSession(plan: Plan) {
  return apiFetch<{ url: string }>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

export function createPortalSession() {
  return apiFetch<{ url: string }>("/billing/portal", { method: "POST" });
}
