"use client";

import { AlertCircle, Check, Loader2, Replace } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScaledIngredient } from "@/lib/ingredient-calculator";
import { useLanguage } from "@/providers/language-provider";
import { getSubstitutions } from "@/services/cooking";
import type { Ingredient, SubstitutionResult } from "@/types/api";

export type AppliedSubstitution = {
  originalIngredient: string;
  substitute: string;
  displayQuantity: string;
  adjustment: string;
  expectedDifference: string;
};

type Props = {
  recipeId: number;
  servings: number;
  ingredients: Ingredient[];
  scaledIngredients: ScaledIngredient[];
  onApply: (substitution: AppliedSubstitution) => void;
};

function suitabilityLabel(
  suitability: string | undefined,
  index: number,
  t: (key: string) => string
) {
  if (suitability === "Best Match") return t("substitution.bestMatch");
  if (suitability === "Good Alternative") return t("substitution.goodAlternative");
  if (suitability === "Possible Alternative") return t("substitution.possibleAlternative");
  return suitability || (index === 0
    ? t("substitution.bestMatch")
    : t("substitution.goodAlternative"));
}

export function SubstitutionAssistant({
  recipeId,
  servings,
  ingredients,
  scaledIngredients,
  onApply,
}: Props) {
  const { t } = useLanguage();
  const [ingredientId, setIngredientId] = useState("");
  const [result, setResult] = useState<SubstitutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const selectedIngredient = ingredients.find(
    (ingredient) => ingredient.id === Number(ingredientId)
  );
  const scaledIngredient = useMemo(
    () =>
      selectedIngredient
        ? scaledIngredients.find(
            (item) =>
              item.name.trim().toLowerCase() ===
              selectedIngredient.name.trim().toLowerCase()
          )
        : undefined,
    [scaledIngredients, selectedIngredient]
  );

  async function findSubstitute() {
    if (!selectedIngredient || loading) return;
    setLoading(true);
    setResult(null);
    setError(false);
    try {
      setResult(
        await getSubstitutions(selectedIngredient.name, recipeId, {
          ingredientId: selectedIngredient.id,
          servings,
        })
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Replace className="size-4" />
        </span>
        <div>
          <h3 className="font-extrabold">{t("substitution.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("substitution.description")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label htmlFor="missing-ingredient" className="mb-1.5 block text-sm font-semibold">
            {t("substitution.missingIngredient")}
          </label>
          <select
            id="missing-ingredient"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={ingredientId}
            onChange={(event) => {
              setIngredientId(event.target.value);
              setResult(null);
              setError(false);
            }}
          >
            <option value="">{t("substitution.selectIngredient")}</option>
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          className="h-11 self-end rounded-full"
          disabled={!selectedIngredient || loading}
          aria-label={t("substitution.findAccessible")}
          onClick={findSubstitute}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Replace className="size-4" />}
          {loading ? t("substitution.finding") : t("substitution.find")}
        </Button>
      </div>

      {selectedIngredient && scaledIngredient && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 text-sm">
          <span className="font-semibold">{selectedIngredient.name}</span>
          <strong className="text-primary">{scaledIngredient.displayQuantity}</strong>
        </div>
      )}

      <div aria-live="polite" aria-busy={loading} className="mt-4">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {t("substitution.error")}
          </div>
        )}

        {result && result.options.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center">
            <p className="font-extrabold">{t("substitution.noneTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.no_substitute_reason || t("substitution.noneDescription")}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 rounded-full"
              onClick={() => {
                setIngredientId("");
                setResult(null);
              }}
            >
              {t("substitution.tryAnother")}
            </Button>
          </div>
        )}

        {result && result.options.length > 0 && (
          <div className="space-y-3">
            {result.options.slice(0, 3).map((option, index) => (
              <article key={option.substitution} className="rounded-2xl border border-border bg-surface/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Badge variant={index === 0 ? "default" : "secondary"} className="rounded-full">
                      {suitabilityLabel(option.suitability, index, t)}
                    </Badge>
                    <h4 className="mt-2 text-lg font-extrabold">{option.substitution}</h4>
                  </div>
                  <strong className="text-primary">
                    {scaledIngredient?.displayQuantity || option.display_quantity}
                  </strong>
                </div>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-bold">{t("substitution.why")}</dt>
                    <dd className="mt-0.5 text-muted-foreground">{option.why_it_works}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">{t("substitution.adjustment")}</dt>
                    <dd className="mt-0.5 text-muted-foreground">{option.adjustment || option.how_much}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-bold">{t("substitution.expectedDifference")}</dt>
                    <dd className="mt-0.5 text-muted-foreground">{option.what_changes}</dd>
                  </div>
                </dl>
                <Button
                  type="button"
                  variant={index === 0 ? "default" : "outline"}
                  className="mt-4 w-full rounded-full sm:w-auto"
                  onClick={() =>
                    selectedIngredient &&
                    onApply({
                      originalIngredient: selectedIngredient.name,
                      substitute: option.substitution,
                      displayQuantity:
                        scaledIngredient?.displayQuantity ||
                        option.display_quantity ||
                        "",
                      adjustment: option.adjustment || option.how_much,
                      expectedDifference: option.what_changes,
                    })
                  }
                >
                  <Check className="size-4" />
                  {t("substitution.use")}
                </Button>
              </article>
            ))}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {result.context_warning}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
