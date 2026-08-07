import { apiClient, unwrap } from "@/lib/api-client";
import type { Favorite } from "@/types/api";

export async function getFavorites() {
  return unwrap<{ count: number; favorites: Favorite[] }>(
    apiClient.get("/favorites")
  );
}

export async function addFavorite(recipeId: number) {
  return unwrap<{ favorite: Favorite }>(
    apiClient.post("/favorites", { recipe_id: recipeId })
  );
}

export async function removeFavorite(recipeId: number) {
  await apiClient.delete(`/favorites/${recipeId}`);
}
