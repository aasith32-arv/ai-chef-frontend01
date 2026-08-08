import { apiClient, unwrap } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n/types";
import type { AIMealPlan, AISuggestResult } from "@/types/api";

export type TranslatedRecipe = {
  dish: string;
  description: string;
  ingredients: AIMealPlan["ingredients"];
  steps: string[];
  tips: string[];
  language: string;
  source: string;
};

export type AIStatus = {
  configured: boolean;
  provider: "openai" | "gemini" | "none";
  model: string;
  message: string;
  reachable?: boolean;
};

export async function getAIStatus() {
  return unwrap<AIStatus>(apiClient.get("/ai/status"));
}

export async function getAIMealPlan(
  dish: string,
  people: number,
  language: Locale = "en"
) {
  return unwrap<AIMealPlan>(
    apiClient.post("/ai/plan", { dish, people, language })
  );
}

export async function getAISuggestions(
  ingredients: string[],
  language: Locale = "en"
) {
  return unwrap<AISuggestResult>(
    apiClient.post("/ai/suggest", { ingredients, language })
  );
}

export async function translateRecipeContent(
  content: {
    dish?: string;
    name?: string;
    description?: string;
    people?: number;
    ingredients?: AIMealPlan["ingredients"] | Array<{
      name: string;
      quantity: number;
      unit: string;
      display?: string;
      displayQuantity?: string;
    }>;
    steps?: string[];
    tips?: string[];
  },
  language: Locale
) {
  const normalized = {
    dish: content.dish || content.name || "",
    description: content.description || "",
    people: content.people || 1,
    ingredients: (content.ingredients || []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      display:
        ("display" in item && item.display) ||
        ("displayQuantity" in item && item.displayQuantity) ||
        `${item.quantity} ${item.unit}`,
    })),
    steps: content.steps || [],
    tips: content.tips || [],
  };

  return unwrap<TranslatedRecipe>(
    apiClient.post("/ai/translate", { content: normalized, language })
  );
}
