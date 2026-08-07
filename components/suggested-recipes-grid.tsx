"use client";

import type { RecommendationItem } from "@/types/api";
import { SuggestRecipeCard } from "@/components/suggest-recipe-card";
import { useLanguage } from "@/providers/language-provider";

type SuggestedRecipesGridProps = {
  results: RecommendationItem[];
};

export function SuggestedRecipesGrid({ results }: SuggestedRecipesGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {results.map(({ recipe, match_percentage, missing_ingredients }, index) => {
        const total = recipe.ingredients?.length ?? 0;
        const matched = Math.max(0, total - missing_ingredients.length);
        const percent = Math.round(match_percentage);

        return (
          <SuggestRecipeCard
            key={recipe.id}
            index={index}
            title={recipe.name}
            category={recipe.category}
            description={recipe.description || "No description available."}
            matchPercent={percent}
            matchLabel={`${matched}/${total || "?"} · ${percent}%`}
            missing={missing_ingredients}
            image={recipe.image}
            href={`/recipe/${recipe.id}`}
            actionLabel={t("suggest.viewRecipe")}
          />
        );
      })}
    </div>
  );
}
