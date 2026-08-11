/** Curated premium food photography (Unsplash) mapped by dish / category. */

const BY_NAME: Record<string, string> = {
  "chicken biryani":
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
  "vegetable fried rice":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80",
  "chicken fried rice":
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  "egg fried rice":
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
  kottu:
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
  "nasi goreng":
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  "vegetable curry":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
  "chicken curry":
    "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=1200&q=80",
  "dhal curry":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
  "fish curry":
    "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80",
};

const BY_CATEGORY: Record<string, string> = {
  rice: "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&w=1200&q=80",
  curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
  street: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
};

const BIRYANI_IMAGES = [
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
];

const HERO =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80";

export function foodHeroImage() {
  return HERO;
}

export function foodImageFor(
  name?: string | null,
  category?: string | null
): string {
  const key = (name || "").trim().toLowerCase();
  if (key && BY_NAME[key]) return BY_NAME[key];
  if (key.includes("biryani")) {
    const hash = Array.from(key).reduce((total, character) => total + character.charCodeAt(0), 0);
    return BIRYANI_IMAGES[hash % BIRYANI_IMAGES.length];
  }

  const cat = (category || "").trim().toLowerCase();
  if (cat.includes("rice")) return BY_CATEGORY.rice;
  if (cat.includes("curry")) return BY_CATEGORY.curry;
  if (cat.includes("street") || cat.includes("kottu")) return BY_CATEGORY.street;
  return BY_CATEGORY.default;
}
