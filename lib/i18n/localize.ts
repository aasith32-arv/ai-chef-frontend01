import type { Locale } from "./types";
import lexicon from "./lexicon.json";

type LexEntry = { en: string; ta: string; si: string };

const entries = lexicon as Record<string, LexEntry>;

export function localizeIngredientName(name: string, locale: Locale): string {
  if (locale === "en") return name;
  const key = name.trim().toLowerCase();
  if (entries[key]?.[locale]) return entries[key][locale];

  for (const [k, v] of Object.entries(entries)) {
    if (key.includes(k) || k.includes(key)) {
      return v[locale] || name;
    }
  }
  return name;
}

export function localizeUnit(unit: string, locale: Locale): string {
  if (locale === "en") return unit;
  const key = unit.trim().toLowerCase();
  return entries[key]?.[locale] || unit;
}

export function localizeDisplayQuantity(
  display: string,
  locale: Locale
): string {
  if (locale === "en" || !display) return display;
  let out = display;
  const units = ["kg", "ml", "g", "tsp", "tbsp", "pieces", "piece", "L", "l"];
  for (const unit of units) {
    const localized = localizeUnit(unit, locale);
    if (localized !== unit) {
      out = out.replace(new RegExp(`\\b${unit}\\b`, "gi"), localized);
    }
  }
  return out;
}

export function localizeIngredientList<
  T extends { name: string; unit?: string; displayQuantity?: string; display?: string },
>(items: T[], locale: Locale): T[] {
  return items.map((item) => ({
    ...item,
    name: localizeIngredientName(item.name, locale),
    unit: item.unit ? localizeUnit(item.unit, locale) : item.unit,
    displayQuantity: item.displayQuantity
      ? localizeDisplayQuantity(item.displayQuantity, locale)
      : item.displayQuantity,
    display: item.display
      ? localizeDisplayQuantity(item.display, locale)
      : item.display,
  }));
}
