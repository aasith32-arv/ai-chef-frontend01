import { apiClient, unwrap } from "@/lib/api-client";
import type { CalculateResult } from "@/types/api";

export type CalculatePayload = {
  recipe: string;
  people: number;
};

export async function calculateQuantities(payload: CalculatePayload) {
  return unwrap<CalculateResult>(apiClient.post("/calculate", payload));
}
