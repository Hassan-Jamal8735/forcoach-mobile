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

export function createCheckoutSession(plan: Plan, returnTo?: string) {
  return apiFetch<{ url: string }>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan, returnTo }),
  });
}

export function createPortalSession(returnTo?: string) {
  return apiFetch<{ url: string }>("/billing/portal", { method: "POST", body: JSON.stringify({ returnTo }) });
}

/**
 * Stripe's webhook can land a moment after the checkout page redirects, so
 * poll briefly before concluding the subscription didn't start.
 */
export async function waitForActiveSubscription(timeoutMs = 8000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    const status = await getBillingStatus().catch(() => null);
    if (status && ["active", "trialing"].includes(status.status)) return true;
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, 1500));
  }
}
