export type Locale = "en" | "ta" | "si";

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "si", label: "Sinhala", native: "සිංහල" },
];

export const LOCALE_STORAGE_KEY = "ai-chef-locale";
