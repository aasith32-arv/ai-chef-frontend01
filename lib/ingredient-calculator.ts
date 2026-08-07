import type { Ingredient } from "@/types/api";

export type ScaledIngredient = {
  name: string;
  quantity: number;
  unit: string;
  displayQuantity: string;
};

function roundSmart(value: number): number {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
}

function formatWithUnit(quantity: number, unit: string): string {
  const q = roundSmart(quantity);

  if (unit === "g" && q >= 1000) {
    return `${roundSmart(q / 1000)} kg`;
  }
  if (unit === "ml" && q >= 1000) {
    return `${roundSmart(q / 1000)} L`;
  }
  if (unit === "piece" || unit === "pcs") {
    const pieces = Math.max(1, Math.round(q));
    return `${pieces} ${pieces === 1 ? "piece" : "pieces"}`;
  }

  return `${q} ${unit}`;
}

/**
 * Client-side scaling for recipe detail serving adjustments.
 * Primary calculate flow uses POST /calculate from the API.
 */
export function scaleIngredientList(
  ingredients: Ingredient[],
  baseServings: number,
  targetServings: number
): ScaledIngredient[] {
  const factor = Math.max(1, targetServings) / Math.max(1, baseServings);
  return ingredients.map((item) => {
    const quantity = item.quantity * factor;
    return {
      name: item.name,
      quantity: roundSmart(quantity),
      unit: item.unit,
      displayQuantity: formatWithUnit(quantity, item.unit),
    };
  });
}
