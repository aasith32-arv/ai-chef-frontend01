import { apiClient, unwrap } from "@/lib/api-client";
import type { RecommendResult } from "@/types/api";

export async function recommendRecipes(
  ingredients: string[],
  partial = true
) {
  return unwrap<RecommendResult>(
    apiClient.post(
      "/recommend",
      { ingredients },
      { params: { partial: partial ? "true" : "false" } }
    )
  );
}
