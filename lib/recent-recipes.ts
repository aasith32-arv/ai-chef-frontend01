import type { Recipe } from "@/types/api";

const STORAGE_KEY = "ai-chef:recent-recipes";
const MAX_ITEMS = 8;

export type RecentRecipe = Pick<
  Recipe,
  "id" | "name" | "category" | "image" | "serving_size"
> & { viewedAt: number };

let cachedRaw: string | null = null;
let cachedItems: RecentRecipe[] = [];

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseItems(raw: string): RecentRecipe[] {
  try {
    const parsed = JSON.parse(raw) as RecentRecipe[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort((a, b) => b.viewedAt - a.viewedAt);
  } catch {
    return [];
  }
}

function getSnapshot(): RecentRecipe[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  cachedItems = parseItems(raw);
  return cachedItems;
}

function write(items: RecentRecipe[]) {
  const next = items.slice(0, MAX_ITEMS);
  const raw = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedItems = [...next].sort((a, b) => b.viewedAt - a.viewedAt);
  window.dispatchEvent(new Event("ai-chef:recent-recipes"));
}

export function getRecentRecipes(): RecentRecipe[] {
  return getSnapshot();
}

export function subscribeRecentRecipes(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("ai-chef:recent-recipes", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("ai-chef:recent-recipes", handler);
  };
}

export function trackRecipeView(recipe: Recipe) {
  const next: RecentRecipe = {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    image: recipe.image,
    serving_size: recipe.serving_size,
    viewedAt: Date.now(),
  };
  const rest = getSnapshot().filter((item) => item.id !== recipe.id);
  write([next, ...rest]);
}
