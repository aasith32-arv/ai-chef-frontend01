import { apiClient, unwrap } from "@/lib/api-client";
import type {
  DishFamily,
  DishFamilyListData,
  FamilyRecipeListData,
} from "@/types/api";
import type { RecipeQuery } from "@/services/recipes";

export async function getDishFamilies(params: {
  category?: string;
  search?: string;
} = {}) {
  return unwrap<DishFamilyListData>(
    apiClient.get("/dish-families", { params })
  );
}

export async function getDishFamily(slug: string) {
  return unwrap<{ family: DishFamily }>(
    apiClient.get(`/dish-families/${encodeURIComponent(slug)}`)
  );
}

export async function getDishFamilyRecipes(
  slug: string,
  params: Omit<RecipeQuery, "category" | "family"> = {}
) {
  return unwrap<FamilyRecipeListData>(
    apiClient.get(`/dish-families/${encodeURIComponent(slug)}/recipes`, {
      params,
    })
  );
}
