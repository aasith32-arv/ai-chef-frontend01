export type NutritionPayload = {
  source: "usda" | "estimated";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  label: string;
};

export function estimateNutrition(
  seed: string,
  people: number
): NutritionPayload {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const scale = Math.max(people, 1);
  const baseCal = 320 + (hash % 120);
  return {
    source: "estimated",
    calories: Math.round(baseCal * scale * 0.35),
    protein: Math.round(18 + (hash % 12) + scale * 0.8),
    carbs: Math.round(32 + (hash % 20) + scale * 1.1),
    fat: Math.round(10 + (hash % 8) + scale * 0.4),
    label: "Estimated nutrition (illustrative fallback)",
  };
}
