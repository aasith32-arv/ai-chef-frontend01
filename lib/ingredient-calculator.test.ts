import { describe, expect, it } from "vitest";
import { scaleIngredientList } from "@/lib/ingredient-calculator";
import type { Ingredient } from "@/types/api";

const ingredients: Ingredient[] = [
  { id: 1, name: "Rice", quantity: 200, unit: "g" },
  { id: 2, name: "Oil", quantity: 50, unit: "ml" },
  { id: 3, name: "Onion", quantity: 1, unit: "piece" },
];

describe("scaleIngredientList", () => {
  it("doubles quantities when servings double", () => {
    const scaled = scaleIngredientList(ingredients, 4, 8);
    expect(scaled[0]).toMatchObject({
      name: "Rice",
      quantity: 400,
      displayQuantity: "400 g",
    });
    expect(scaled[2].displayQuantity).toBe("2 pieces");
  });

  it("converts grams to kg above 1000", () => {
    const scaled = scaleIngredientList(
      [{ id: 1, name: "Flour", quantity: 600, unit: "g" }],
      2,
      4
    );
    expect(scaled[0].displayQuantity).toBe("1.2 kg");
  });

  it("treats zero/negative target servings as at least 1", () => {
    const scaled = scaleIngredientList(ingredients, 4, 0);
    // factor = 1/4
    expect(scaled[0].quantity).toBe(50);
  });

  it("keeps identity when servings unchanged", () => {
    const scaled = scaleIngredientList(ingredients, 4, 4);
    expect(scaled.map((item) => item.displayQuantity)).toEqual([
      "200 g",
      "50 ml",
      "1 piece",
    ]);
  });
});
