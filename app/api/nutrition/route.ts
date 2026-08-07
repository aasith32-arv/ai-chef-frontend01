import { NextResponse } from "next/server";
import { estimateNutrition, type NutritionPayload } from "@/lib/nutrition";

/**
 * Optional USDA FoodData Central lookup.
 * Set USDA_API_KEY in the environment (server-only). Without it, returns labeled estimates.
 * Docs: https://fdc.nal.usda.gov/api-guide.html
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "chicken").trim();
  const people = Math.max(1, Number(searchParams.get("people") || "1") || 1);
  const apiKey = process.env.USDA_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(estimateNutrition(q, people));
  }

  try {
    const searchUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    searchUrl.searchParams.set("api_key", apiKey);
    searchUrl.searchParams.set("query", q);
    searchUrl.searchParams.set("pageSize", "1");

    const searchRes = await fetch(searchUrl.toString(), {
      next: { revalidate: 3600 },
    });
    if (!searchRes.ok) {
      return NextResponse.json(estimateNutrition(q, people));
    }
    const searchJson = (await searchRes.json()) as {
      foods?: Array<{
        description?: string;
        foodNutrients?: Array<{
          nutrientName?: string;
          value?: number;
        }>;
      }>;
    };
    const food = searchJson.foods?.[0];
    if (!food?.foodNutrients?.length) {
      return NextResponse.json(estimateNutrition(q, people));
    }

    const pick = (names: string[]) => {
      const hit = food.foodNutrients!.find((n) =>
        names.some((name) =>
          (n.nutrientName || "").toLowerCase().includes(name.toLowerCase())
        )
      );
      return hit?.value ?? 0;
    };

    const payload: NutritionPayload = {
      source: "usda",
      calories: Math.round(pick(["Energy"]) * people),
      protein: Math.round(pick(["Protein"]) * people),
      carbs: Math.round(pick(["Carbohydrate"]) * people),
      fat: Math.round(pick(["Total lipid", "Fat"]) * people),
      label: `USDA: ${food.description || q} (scaled ×${people})`,
    };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(estimateNutrition(q, people));
  }
}
