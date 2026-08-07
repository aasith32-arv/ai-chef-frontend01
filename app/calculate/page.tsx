"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Printer,
  Share2,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { AIMealPlan, Recipe } from "@/types/api";
import { DishSelector } from "@/components/dish-selector";
import { GuestStepper } from "@/components/recipe/guest-stepper";
import { NutritionStrip } from "@/components/recipe/nutrition-strip";
import { IngredientResultsTable } from "@/components/ingredient-results-table";
import { StepsAccordion } from "@/components/steps-accordion";
import { EmptyState } from "@/components/empty-state";
import { SaveButton } from "@/components/save-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIStatusBanner } from "@/components/ai-status-banner";
import { IngredientTableSkeleton } from "@/components/loading-skeletons";
import { getErrorMessage } from "@/lib/api-client";
import { localizeIngredientList } from "@/lib/i18n/localize";
import { LOCALES } from "@/lib/i18n/types";
import { quantitiesToRows, recipeImage } from "@/lib/recipe-utils";
import { foodImageFor } from "@/lib/food-images";
import { addShoppingItems } from "@/lib/shopping-list";
import { getAIMealPlan, translateRecipeContent } from "@/services/ai";
import { calculateQuantities } from "@/services/calculator";
import { getAllRecipes } from "@/services/recipes";
import { useLanguage } from "@/providers/language-provider";

export default function CalculatePage() {
  return (
    <Suspense fallback={<IngredientTableSkeleton />}>
      <CalculateContent />
    </Suspense>
  );
}

function CalculateContent() {
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();
  const dishFromQuery = searchParams.get("dish")?.trim() || "";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [dishName, setDishName] = useState(dishFromQuery);
  const [syncedQuery, setSyncedQuery] = useState(dishFromQuery);
  const [matchedRecipe, setMatchedRecipe] = useState<Recipe | null>(null);
  const [people, setPeople] = useState(25);
  const [plan, setPlan] = useState<AIMealPlan | null>(null);
  const [loading, setLoading] = useState(false);

  if (dishFromQuery !== syncedQuery) {
    setSyncedQuery(dishFromQuery);
    if (dishFromQuery) {
      setDishName(dishFromQuery);
      setPlan(null);
    }
  }

  useEffect(() => {
    let active = true;
    getAllRecipes()
      .then((items) => {
        if (!active) return;
        setRecipes(items);
        const fromQuery = searchParams.get("dish");
        if (fromQuery) {
          const match = items.find(
            (r) => r.name.toLowerCase() === fromQuery.toLowerCase()
          );
          if (match) setMatchedRecipe(match);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(getErrorMessage(error, t("common.errorLoadRecipes")));
        }
      })
      .finally(() => {
        if (active) setLoadingRecipes(false);
      });
    return () => {
      active = false;
    };
  }, [searchParams, t]);

  async function handleGenerate() {
    const dish = dishName.trim();
    if (!dish) {
      toast.error(t("calculate.selectDish"));
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
      const aiPlan = await getAIMealPlan(dish, people, locale);
      setPlan(aiPlan);
      toast.success(t("calculate.planReady"));
    } catch (aiError) {
      try {
        const local = await calculateQuantities({ recipe: dish, people });
        const recipe =
          matchedRecipe ||
          recipes.find((r) => r.name.toLowerCase() === dish.toLowerCase()) ||
          null;

        const basePlan: AIMealPlan = {
          dish: local.recipe,
          category: recipe?.category || "Local",
          description:
            recipe?.description ||
            "Scaled from your Smart Chef recipe database.",
          people: local.people,
          ingredients: Object.entries(local.quantities).map(
            ([name, display]) => ({
              name,
              quantity: 0,
              unit: "",
              display,
            })
          ),
          steps: recipe?.steps || [],
          tips: [],
          source: "local",
          language: "en",
        };

        if (locale !== "en") {
          try {
            const translated = await translateRecipeContent(basePlan, locale);
            setPlan({
              ...basePlan,
              dish: translated.dish || basePlan.dish,
              description: translated.description || basePlan.description,
              ingredients: translated.ingredients.length
                ? translated.ingredients
                : basePlan.ingredients,
              steps: translated.steps.length
                ? translated.steps
                : basePlan.steps,
              tips: translated.tips,
              language: locale,
              source: "local+ai-translate",
            });
          } catch {
            setPlan({
              ...basePlan,
              ingredients: localizeIngredientList(basePlan.ingredients, locale),
              language: locale,
            });
            toast.message(t("calculate.localFallback"));
          }
        } else {
          setPlan(basePlan);
          toast.message(t("calculate.localFallback"));
        }
      } catch {
        toast.error(getErrorMessage(aiError, "Could not generate meal plan"));
      }
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    if (!plan) return [];
    const mapped = plan.ingredients.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      displayQuantity: item.display,
    }));
    return locale === "en" || plan.language === locale
      ? mapped
      : localizeIngredientList(mapped, locale);
  }, [plan, locale]);

  const languageLabel =
    LOCALES.find((item) => item.code === locale)?.native || locale;

  const heroSrc = matchedRecipe
    ? recipeImage(matchedRecipe)
    : foodImageFor(dishName || "default");

  function handleShare() {
    const text = plan
      ? `${plan.dish} for ${plan.people} guests — scaled with AI Chef`
      : "AI Chef recipe calculator";
    if (navigator.share) {
      navigator.share({ title: "AI Chef", text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    }
  }

  return (
    <div className="container-premium py-8 sm:py-12">
      <div className="mb-6 max-w-2xl">
        <Badge className="mb-3 rounded-full bg-primary/10 text-primary">
          <Sparkles className="mr-1 size-3.5" />
          Premium calculator
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("calculate.title")}
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          {t("calculate.subtitle")}
        </p>
      </div>

      <AIStatusBanner />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr]">
        <aside className="card-premium h-fit space-y-6 overflow-hidden p-0">
          <div className="relative aspect-[16/11] overflow-hidden">
            <Image
              src={heroSrc}
              alt={dishName || "Recipe"}
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-lg font-bold text-white drop-shadow">
                {dishName || "Choose a dish"}
              </p>
            </div>
          </div>
          <div className="space-y-6 px-5 pb-6 pt-1 sm:px-6">
            <DishSelector
              recipes={recipes}
              value={dishName}
              disabled={loadingRecipes || loading}
              onChange={(name, recipe) => {
                setDishName(name);
                setMatchedRecipe(recipe ?? null);
                setPlan(null);
              }}
            />
            <GuestStepper value={people} onChange={setPeople} />
            <Button
              className="w-full rounded-full shadow-premium"
              size="lg"
              disabled={loading || !dishName.trim()}
              onClick={handleGenerate}
            >
              <Sparkles className="size-4" />
              {loading ? t("calculate.generating") : t("calculate.generate")}
            </Button>
          </div>
        </aside>

        <div className="space-y-4">
          {loading ? (
            <IngredientTableSkeleton />
          ) : !plan ? (
            <EmptyState
              icon={Sparkles}
              title={t("calculate.readyTitle")}
              description={t("calculate.readyDesc")}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${plan.dish}-${plan.people}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {plan.dish}
                  </h2>
                  <Badge variant="secondary" className="rounded-full">
                    {plan.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {languageLabel}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    <Clock3 className="mr-1 size-3.5" />
                    {20 + (plan.people % 7) * 5} min
                  </Badge>
                </div>

                {plan.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                )}

                <NutritionStrip people={plan.people} seed={plan.dish} />

                <IngredientResultsTable
                  ingredients={rows.length ? rows : quantitiesToRows({})}
                  people={plan.people}
                  dishName={plan.dish}
                />

                {plan.steps.length > 0 && <StepsAccordion steps={plan.steps} />}

                {plan.tips.length > 0 && (
                  <div className="rounded-3xl bg-surface p-5 text-sm leading-relaxed shadow-sm ring-1 ring-border">
                    <p className="font-bold">{t("calculate.tips")}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      {plan.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {matchedRecipe && (
                    <>
                      <SaveButton
                        recipeId={matchedRecipe.id}
                        recipeName={matchedRecipe.name}
                        className="rounded-full"
                      />
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href={`/recipe/${matchedRecipe.id}`}>
                          <BookOpen className="size-4" />
                          {t("calculate.openRecipe")}
                        </Link>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      const source = rows.length
                        ? rows
                        : quantitiesToRows({});
                      if (!source.length) {
                        toast.error("No ingredients to add");
                        return;
                      }
                      addShoppingItems(
                        source.map((row) => ({
                          name: row.name,
                          quantity: row.displayQuantity || String(row.quantity),
                          unit: row.unit || undefined,
                          dish: plan.dish,
                        }))
                      );
                      toast.success(
                        `Added ${source.length} items to shopping list`
                      );
                    }}
                  >
                    <ShoppingCart className="size-4" />
                    Add to shopping list
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handleShare}
                  >
                    <Share2 className="size-4" />
                    Share
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
