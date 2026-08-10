import { apiClient, unwrap } from "@/lib/api-client";
import type { Recipe, RecipeListData } from "@/types/api";

export type RecipeQuery = {
  search?: string;
  category?: string;
  family?: string;
  cuisine?: string;
  region?: string;
  protein?: string;
  diet_type?: string;
  difficulty?: string;
  spice_level?: string;
  max_cook_time?: number;
  page?: number;
  per_page?: number;
};

export async function getRecipes(params: RecipeQuery = {}) {
  return unwrap<RecipeListData>(apiClient.get("/recipes", { params }));
}

export async function getRecipe(id: number) {
  return unwrap<{ recipe: Recipe }>(apiClient.get(`/recipes/${id}`));
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const items: Recipe[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await getRecipes({ page, per_page: 50 });
    items.push(...data.items);
    hasNext = (data.meta ?? data.pagination)?.has_next ?? false;
    page += 1;
  }

  return items;
}
