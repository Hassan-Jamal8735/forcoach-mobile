import { cacheDirectory, downloadAsync } from "expo-file-system/legacy";
import { API_URL, ApiError, apiFetch, getValidAccessToken } from "./client";

export type InvoiceStatus = "draft" | "generated" | "archived";

export type Invoice = {
  id: string;
  user_id: string;
  studio_id: string | null;
  studio_name: string;
  period_start: string;
  period_end: string;
  invoice_number: string | null;
  issue_date: string | null;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  vat_rate: number | null;
  vat_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceLineItem = {
  id: string;
  invoice_id: string;
  title: string;
  event_date: string;
  hours: number;
  rate: number;
  compensation_type: "hourly" | "per_class";
  amount: number;
};

export type InvoiceDetail = {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
};

export type CreateInvoiceInput = {
  studioId: string;
  periodStart: string;
  periodEnd: string;
  dueDate?: string;
  vatRate?: number;
};

export function listInvoices() {
  return apiFetch<Invoice[]>("/invoices");
}

export function getInvoice(id: string) {
  return apiFetch<InvoiceDetail>(`/invoices/${id}`);
}

export function createInvoice(input: CreateInvoiceInput) {
  return apiFetch<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function generateInvoice(id: string) {
  return apiFetch<Invoice>(`/invoices/${id}/generate`, { method: "POST" });
}

export function deleteInvoice(id: string) {
  return apiFetch<void>(`/invoices/${id}`, { method: "DELETE" });
}

export function updateLineItemRate(invoiceId: string, lineItemId: string, rate: number) {
  return apiFetch<void>(`/invoices/${invoiceId}/line-items/${lineItemId}`, {
    method: "PATCH",
    body: JSON.stringify({ rate }),
  });
}

export function updateInvoice(id: string, input: { dueDate?: string; vatRate?: number; notes?: string }) {
  return apiFetch<Invoice>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

/** Downloads the invoice PDF to the app cache and returns its local file URI. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw new ApiError(401, "Not authenticated");
  const filename = `${invoice.invoice_number ?? `draft-${invoice.id.slice(0, 8)}`}.pdf`;
  const result = await downloadAsync(`${API_URL}/invoices/${invoice.id}/pdf`, `${cacheDirectory}${filename}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (result.status !== 200) throw new ApiError(result.status, "Could not download the PDF");
  return result.uri;
}
