import { apiClient, unwrap } from "@/lib/api-client";
import type {
  CookingPlanData,
  CookingPreferences,
  SubstitutionResult,
  TroubleshootingResult,
} from "@/types/api";

export async function getCookingPlan(
  recipeId: number,
  preferences: Partial<CookingPreferences>
) {
  return unwrap<CookingPlanData>(
    apiClient.post(`/recipes/${recipeId}/cooking-plan`, preferences)
  );
}

export async function troubleshootCooking(problem: string, context = "") {
  return unwrap<TroubleshootingResult>(
    apiClient.post("/cooking/troubleshoot", { problem, context })
  );
}

export async function getSubstitutions(
  ingredient: string,
  recipeId: number,
  context: { ingredientId?: number; servings?: number } = {}
) {
  return unwrap<SubstitutionResult>(
    apiClient.post("/cooking/substitute", {
      ingredient,
      recipe_id: recipeId,
      ingredient_id: context.ingredientId,
      servings: context.servings,
    })
  );
}
