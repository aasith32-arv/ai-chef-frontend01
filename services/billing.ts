import { apiClient, unwrap } from "@/lib/api-client";
import type { BillingStatus } from "@/types/api";

export type BillingProduct = "subscription" | "advertising";

export function createCheckout(product: BillingProduct) {
  return unwrap<{ checkout_url: string; session_id: string }>(
    apiClient.post(`/billing/checkout/${product}`)
  );
}

export function createBillingPortal() {
  return unwrap<{ portal_url: string }>(apiClient.post("/billing/portal"));
}

export function getBillingStatus() {
  return unwrap<BillingStatus>(apiClient.get("/billing/status"));
}
