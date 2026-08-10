import { describe, expect, it } from "vitest";
import { filterRecipeVarieties } from "@/lib/discovery";
import type { DishFamily, Recipe } from "@/types/api";

const family: DishFamily = {
  id: 1,
  name: "Biryani",
  slug: "biryani",
  description: "Regional rice dishes",
  category: "Rice Dishes",
  image: null,
  is_active: true,
};

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: 1,
    name: "Hyderabadi Chicken Biryani",
    slug: "hyderabadi-chicken-biryani",
    category: "Rice Dishes",
    family_id: 1,
    family,
    description: null,
    serving_size: 4,
    steps: ["Cook"],
    image: null,
    cuisine: "Indian",
    region: "Hyderabad",
    protein: "Chicken",
    diet_type: "Omnivore",
    difficulty: "Advanced",
    prep_time: 35,
    cook_time: 65,
    spice_level: "Hot",
    tags: ["dum", "rice"],
    publication_status: "published",
    created_at: "",
    updated_at: "",
    ingredients: [],
    ...overrides,
  };
}

const recipes = [
  makeRecipe({}),
  makeRecipe({
    id: 2,
    name: "Vegetable Biryani",
    slug: "vegetable-biryani",
    protein: "None",
    diet_type: "Vegetarian",
    region: "South Asia",
    spice_level: "Medium",
  }),
];

describe("filterRecipeVarieties", () => {
  it("searches family, name, cuisine, region, protein and tags", () => {
    expect(filterRecipeVarieties(recipes, { search: "Hyderabad" })).toHaveLength(1);
    expect(filterRecipeVarieties(recipes, { search: "biryani" })).toHaveLength(2);
    expect(filterRecipeVarieties(recipes, { search: "chicken" })[0].id).toBe(1);
    expect(filterRecipeVarieties(recipes, { search: "dum" })[0].id).toBe(1);
  });

  it("combines metadata filters", () => {
    expect(
      filterRecipeVarieties(recipes, {
        cuisine: "Indian",
        protein: "Chicken",
        difficulty: "Advanced",
        spiceLevel: "Hot",
      })
    ).toEqual([recipes[0]]);
  });

  it("keeps legacy recipes without family metadata searchable", () => {
    const legacy = makeRecipe({
      id: 3,
      name: "Legacy Curry",
      slug: null,
      family_id: null,
      family: null,
      cuisine: null,
      region: null,
      tags: [],
    });
    expect(filterRecipeVarieties([legacy], { search: "legacy" })).toEqual([legacy]);
  });
});
