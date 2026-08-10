import type { Recipe } from "@/types/api";

export const DISCOVERY_CATEGORIES = [
  { value: "Rice Dishes", labelKey: "discovery.category.rice", emoji: "🍚" },
  { value: "Curries", labelKey: "discovery.category.curries", emoji: "🍛" },
  { value: "Kottu", labelKey: "discovery.category.kottu", emoji: "🥘" },
  { value: "Hoppers", labelKey: "discovery.category.hoppers", emoji: "🥞" },
  { value: "Noodles", labelKey: "discovery.category.noodles", emoji: "🍜" },
  { value: "Pasta", labelKey: "discovery.category.pasta", emoji: "🍝" },
  { value: "Chicken", labelKey: "discovery.category.chicken", emoji: "🍗" },
  { value: "Seafood", labelKey: "discovery.category.seafood", emoji: "🐟" },
  { value: "Vegetarian", labelKey: "discovery.category.vegetarian", emoji: "🥬" },
  { value: "Breakfast", labelKey: "discovery.category.breakfast", emoji: "🍳" },
  { value: "Desserts", labelKey: "discovery.category.desserts", emoji: "🍮" },
] as const;

export type VarietyFilters = {
  search?: string;
  cuisine?: string;
  protein?: string;
  difficulty?: string;
  spiceLevel?: string;
};

export function filterRecipeVarieties(
  recipes: Recipe[],
  filters: VarietyFilters
): Recipe[] {
  const term = filters.search?.trim().toLowerCase() ?? "";
  return recipes.filter((item) => {
    const searchable = [
      item.name,
      item.family?.name,
      item.category,
      item.cuisine,
      item.region,
      item.protein,
      ...(item.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      (!term || searchable.includes(term)) &&
      (!filters.cuisine || item.cuisine === filters.cuisine) &&
      (!filters.protein || item.protein === filters.protein) &&
      (!filters.difficulty || item.difficulty === filters.difficulty) &&
      (!filters.spiceLevel || item.spice_level === filters.spiceLevel)
    );
  });
}
