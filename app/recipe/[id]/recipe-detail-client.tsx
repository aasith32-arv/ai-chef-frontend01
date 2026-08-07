"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import type { Recipe } from "@/types/api";
import { RecipeHeader } from "@/components/recipe-header";
import { IngredientList } from "@/components/ingredient-list";
import { StepsAccordion } from "@/components/steps-accordion";
import { SaveButton } from "@/components/save-button";
import { GuestStepper } from "@/components/recipe/guest-stepper";
import { NutritionStrip } from "@/components/recipe/nutrition-strip";
import { CookingTimer } from "@/components/recipe/cooking-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scaleIngredientList } from "@/lib/ingredient-calculator";
import { localizeIngredientList } from "@/lib/i18n/localize";
import { LOCALES } from "@/lib/i18n/types";
import { trackRecipeView } from "@/lib/recent-recipes";
import { addShoppingItems } from "@/lib/shopping-list";
import { translateRecipeContent } from "@/services/ai";
import { useLanguage } from "@/providers/language-provider";

type RecipeDetailClientProps = {
  recipe: Recipe;
};

export function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const { locale, t } = useLanguage();
  const [servings, setServings] = useState(recipe.serving_size);
  const [translatedName, setTranslatedName] = useState(recipe.name);
  const [translatedDesc, setTranslatedDesc] = useState(
    recipe.description || ""
  );
  const [translatedSteps, setTranslatedSteps] = useState(recipe.steps ?? []);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    trackRecipeView(recipe);
  }, [recipe.id]); // eslint-disable-line react-hooks/exhaustive-deps -- track once per recipe id

  const baseIngredients = useMemo(
    () =>
      scaleIngredientList(
        recipe.ingredients ?? [],
        recipe.serving_size,
        servings
      ),
    [recipe, servings]
  );

  const [ingredients, setIngredients] = useState(baseIngredients);
  const displayIngredients =
    locale === "en" ? baseIngredients : ingredients;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (locale === "en") {
        setTranslatedName(recipe.name);
        setTranslatedDesc(recipe.description || "");
        setTranslatedSteps(recipe.steps ?? []);
        return;
      }

      setTranslating(true);
      try {
        const translated = await translateRecipeContent(
          {
            dish: recipe.name,
            description: recipe.description || "",
            people: servings,
            ingredients: baseIngredients.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              display: item.displayQuantity,
            })),
            steps: recipe.steps ?? [],
          },
          locale
        );
        if (cancelled) return;
        setTranslatedName(translated.dish || recipe.name);
        setTranslatedDesc(translated.description || recipe.description || "");
        setTranslatedSteps(
          translated.steps.length ? translated.steps : recipe.steps ?? []
        );
        setIngredients(
          translated.ingredients.length
            ? translated.ingredients.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                displayQuantity: item.display,
              }))
            : localizeIngredientList(baseIngredients, locale)
        );
      } catch {
        if (cancelled) return;
        setTranslatedName(recipe.name);
        setTranslatedDesc(recipe.description || "");
        setTranslatedSteps(recipe.steps ?? []);
        setIngredients(localizeIngredientList(baseIngredients, locale));
      } finally {
        if (!cancelled) setTranslating(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- translate on locale/servings/recipe id
  }, [locale, servings, recipe.id]);

  const languageLabel =
    LOCALES.find((item) => item.code === locale)?.native || locale;

  const displayRecipe = {
    ...recipe,
    name: translatedName,
    description: translatedDesc,
  };

  function handleAddToList() {
    addShoppingItems(
      displayIngredients.map((item) => ({
        name: item.name,
        quantity: item.displayQuantity || String(item.quantity),
        unit: item.unit,
        dish: displayRecipe.name,
      }))
    );
    toast.success(`Added ${displayIngredients.length} items to shopping list`);
  }

  return (
    <div className="container-premium space-y-6 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant="outline" className="rounded-full">
          {t("recipe.languageNote")} {languageLabel}
        </Badge>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleAddToList}
          >
            <ShoppingCart className="size-4" />
            Shopping list
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/calculate?dish=${encodeURIComponent(recipe.name)}`}>
              Scale for guests
            </Link>
          </Button>
        </div>
      </div>

      {translating && (
        <p className="text-sm text-muted-foreground">{t("recipe.translating")}</p>
      )}

      <RecipeHeader
        recipe={displayRecipe}
        servings={servings}
        actions={
          <SaveButton
            recipeId={recipe.id}
            recipeName={recipe.name}
            className="rounded-full"
          />
        }
        servingsControl={
          <div className="max-w-md space-y-4 rounded-3xl bg-surface p-4 ring-1 ring-border">
            <GuestStepper value={servings} onChange={setServings} max={100} />
            <NutritionStrip people={servings} seed={recipe.name} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <IngredientList
            ingredients={displayIngredients}
            title={t("recipe.ingredients")}
          />
          <StepsAccordion steps={translatedSteps} />
        </div>
        <CookingTimer defaultMinutes={20 + (recipe.id % 5) * 5} />
      </div>
    </div>
  );
}
