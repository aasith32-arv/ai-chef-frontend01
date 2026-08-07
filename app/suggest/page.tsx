"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { AISuggestion, RecommendationItem } from "@/types/api";
import { IngredientInputTags } from "@/components/ingredient-input-tags";
import { SuggestedRecipesGrid } from "@/components/suggested-recipes-grid";
import { SuggestRecipeCard } from "@/components/suggest-recipe-card";
import { EmptyState } from "@/components/empty-state";
import { RecipeGridSkeleton } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { AIStatusBanner } from "@/components/ai-status-banner";
import { getErrorMessage } from "@/lib/api-client";
import { getAISuggestions } from "@/services/ai";
import { recommendRecipes } from "@/services/recommend";
import { useLanguage } from "@/providers/language-provider";

export default function SuggestPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [localResults, setLocalResults] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ingredients.length === 0) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const local = await recommendRecipes(ingredients, true);
        if (cancelled) return;

        if (local.recommendations.length > 0) {
          setLocalResults(local.recommendations);
          setAiSuggestions([]);
        } else {
          setLocalResults([]);
        }

        try {
          const ai = await getAISuggestions(ingredients, locale);
          if (cancelled) return;
          if (ai.suggestions?.length) {
            setAiSuggestions(ai.suggestions);
          }
        } catch {
          // Local results already applied.
        }
      } catch (error) {
        if (!cancelled) {
          setAiSuggestions([]);
          setLocalResults([]);
          toast.error(getErrorMessage(error, "Could not get suggestions"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ingredients, locale]);

  function openCalculate(name: string) {
    router.push(`/calculate?dish=${encodeURIComponent(name)}`);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-16 top-10 size-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 size-64 rounded-full bg-accent/25 blur-3xl" />

      <div className="container-premium relative py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-3xl flex-wrap items-start justify-between gap-4"
        >
          <div className="max-w-2xl">
            <Badge className="mb-4 rounded-full bg-primary/10 text-primary shadow-sm">
              <Wand2 className="mr-1 size-3.5" />
              {t("suggest.badge")}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t("suggest.title")}
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {t("suggest.subtitle")}
            </p>
          </div>
        </motion.div>

        <div className="mt-6">
          <AIStatusBanner />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 max-w-xl"
        >
          <div className="card-premium p-4 sm:p-5">
            <IngredientInputTags value={ingredients} onChange={setIngredients} />
          </div>
        </motion.div>

        <div className="mt-12">
          {ingredients.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title={t("suggest.emptyTitle")}
              description={t("suggest.emptyDesc")}
            />
          ) : loading ? (
            <RecipeGridSkeleton />
          ) : aiSuggestions.length > 0 ? (
            <div className="space-y-5">
              <Badge variant="outline" className="rounded-full bg-card/80">
                <Sparkles className="mr-1 size-3" />
                {t("suggest.matches")}
              </Badge>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {aiSuggestions.map((item, index) => (
                  <SuggestRecipeCard
                    key={item.name}
                    index={index}
                    title={item.name}
                    category={item.category}
                    description={item.description || item.why}
                    matchPercent={item.match_percentage}
                    missing={item.missing_ingredients}
                    onAction={() => openCalculate(item.name)}
                    actionLabel={t("suggest.calculate")}
                  />
                ))}
              </div>
              {localResults.length > 0 && (
                <div className="space-y-4 pt-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("suggest.library")}
                  </p>
                  <SuggestedRecipesGrid results={localResults} />
                </div>
              )}
            </div>
          ) : localResults.length > 0 ? (
            <div className="space-y-5">
              <Badge variant="outline" className="rounded-full bg-card/80">
                <Sparkles className="mr-1 size-3" />
                {localResults.length} {t("suggest.matches")}
              </Badge>
              <SuggestedRecipesGrid results={localResults} />
            </div>
          ) : (
            <EmptyState
              icon={Lightbulb}
              title={t("suggest.noMatchTitle")}
              description={t("suggest.noMatchDesc")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
