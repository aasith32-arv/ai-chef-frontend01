import type { Locale } from "./types";
import catalog from "./ui-messages.json";

type Catalog = Record<Locale, Record<string, string>>;

const messages = catalog as Catalog;

export function translate(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? messages.en?.[key] ?? key;
}
