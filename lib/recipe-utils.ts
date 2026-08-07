import type { Recipe } from "@/types/api";
import { foodImageFor } from "@/lib/food-images";

export const PLACEHOLDER_IMAGE = "/placeholders/dish.svg";

const BLOCKED_HOSTS = new Set(["example.com", "www.example.com", "placeholder.com"]);

function isSafeImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (BLOCKED_HOSTS.has(url.hostname.toLowerCase())) return false;
    return true;
  } catch {
    return false;
  }
}

export function recipeImage(
  recipe: Pick<Recipe, "image" | "name" | "category"> | null | undefined
) {
  const src = recipe?.image?.trim();
  if (src && isSafeImageSrc(src) && !src.includes("placeholder")) return src;
  return foodImageFor(recipe?.name, recipe?.category);
}

export function quantitiesToRows(quantities: Record<string, string>) {
  return Object.entries(quantities).map(([name, displayQuantity]) => ({
    name,
    quantity: 0,
    unit: "",
    displayQuantity,
  }));
}

/** Warm gradient accents for cards */
export function recipeAccent(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hues = [35, 28, 45, 20, 55];
  const hue = hues[hash % hues.length];
  return {
    from: `oklch(0.78 0.14 ${hue})`,
    to: `oklch(0.55 0.16 ${hue + 12})`,
  };
}
