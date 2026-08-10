"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChefHat,
  Clock3,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { IngredientResultsTable } from "@/components/ingredient-results-table";
import {
  SubstitutionAssistant,
  type AppliedSubstitution,
} from "@/components/calculate/substitution-assistant";
import { IngredientTableSkeleton } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localizeIngredientList } from "@/lib/i18n/localize";
import { quantitiesToRows, recipeImage } from "@/lib/recipe-utils";
import { addShoppingItems } from "@/lib/shopping-list";
import { useLanguage } from "@/providers/language-provider";
import { calculateQuantities } from "@/services/calculator";
import { getRecipes } from "@/services/recipes";
import type { CalculateResult, Recipe } from "@/types/api";

const PRESETS = [2, 4, 10, 25, 50, 100];
const MIN_PEOPLE = 1;
const MAX_PEOPLE = 200;

export default function CalculatePage() {
  return (
    <Suspense fallback={<CalculatorPageSkeleton />}>
      <CalculateContent />
    </Suspense>
  );
}

function CalculatorPageSkeleton() {
  return (
    <div className="container-premium py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-muted" />
        <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}

function CalculateContent() {
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();
  const initialDish = searchParams.get("dish")?.trim() || "";
  const [query, setQuery] = useState(initialDish);
  const [results, setResults] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searching, setSearching] = useState(true);
  const [searchError, setSearchError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const [peopleText, setPeopleText] = useState("4");
  const [calculation, setCalculation] = useState<CalculateResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState("");
  const [appliedSubstitutions, setAppliedSubstitutions] = useState<
    Record<string, AppliedSubstitution>
  >({});
  const resultsRef = useRef<HTMLDivElement>(null);

  const people = Number(peopleText);
  const validPeople =
    Number.isInteger(people) && people >= MIN_PEOPLE && people <= MAX_PEOPLE;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError(false);
      getRecipes({ search: query.trim() || undefined, page: 1, per_page: 8 })
        .then((data) => {
          if (!active) return;
          setResults(data.items);
          if (initialDish && !selectedRecipe) {
            const exact = data.items.find(
              (recipe) => recipe.name.toLowerCase() === initialDish.toLowerCase()
            );
            if (exact) {
              setSelectedRecipe(exact);
              setPeopleText(String(exact.serving_size));
              setSearchOpen(false);
            }
          }
        })
        .catch(() => {
          if (active) {
            setResults([]);
            setSearchError(true);
          }
        })
        .finally(() => {
          if (active) setSearching(false);
        });
    }, query.trim() ? 300 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, initialDish, selectedRecipe]);

  function chooseRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setQuery(recipe.name);
    setPeopleText(String(recipe.serving_size));
    setCalculation(null);
    setCalculationError("");
    setAppliedSubstitutions({});
    setSearchOpen(false);
  }

  function updatePeople(next: number) {
    setPeopleText(String(Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, next))));
    setCalculation(null);
    setCalculationError("");
    setAppliedSubstitutions({});
  }

  async function handleCalculate() {
    if (!selectedRecipe || !validPeople || calculating) return;
    setCalculating(true);
    setCalculation(null);
    setCalculationError("");
    setAppliedSubstitutions({});
    try {
      const result = await calculateQuantities({
        recipe: selectedRecipe.name,
        people,
      });
      setCalculation(result);
      window.setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50
      );
    } catch {
      setCalculationError(t("calculate.errorCalculate"));
    } finally {
      setCalculating(false);
    }
  }

  const baseRows = useMemo(() => {
    if (!calculation) return [];
    return quantitiesToRows(calculation.quantities);
  }, [calculation]);

  const rows = useMemo(
    () =>
      locale === "en" ? baseRows : localizeIngredientList(baseRows, locale),
    [baseRows, locale]
  );

  const displayedRows = useMemo(
    () =>
      rows.map((row, index) => {
        const originalName = baseRows[index]?.name || row.name;
        const applied = appliedSubstitutions[originalName.toLowerCase()];
        return applied
          ? {
              ...row,
              name: applied.substitute,
              displayQuantity: applied.displayQuantity || row.displayQuantity,
              substitutedFor: row.name,
            }
          : row;
      }),
    [rows, baseRows, appliedSubstitutions]
  );

  function addToShoppingList() {
    if (!calculation || !displayedRows.length) return;
    addShoppingItems(
      displayedRows.map((row) => ({
        name: row.name,
        quantity: row.displayQuantity,
        dish: calculation.recipe,
      }))
    );
    toast.success(t("calculate.shoppingAdded"));
  }

  const scale = calculation
    ? calculation.people / calculation.serving_size
    : 0;

  return (
    <main className="container-premium py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 max-w-2xl">
          <Badge variant="secondary" className="mb-3 rounded-full">
            <ChefHat className="mr-1 size-3.5" />
            {t("calculate.smartCalculator")}
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("calculate.title")}
          </h1>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {t("calculate.tagline")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("calculate.subtitle")}
          </p>
        </header>

        <section className="card-premium overflow-visible p-5 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <StepHeading number="1" title={t("calculate.chooseRecipe")} />
              <div className="relative">
                <label htmlFor="recipe-search" className="sr-only">
                  {t("calculate.searchRecipes")}
                </label>
                <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="recipe-search"
                  role="combobox"
                  aria-expanded={searchOpen}
                  aria-controls="recipe-search-results"
                  autoComplete="off"
                  className="h-12 rounded-xl pl-10"
                  placeholder={t("calculate.searchRecipes")}
                  value={query}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedRecipe(null);
                    setCalculation(null);
                    setAppliedSubstitutions({});
                    setSearchOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && results[0]) {
                      event.preventDefault();
                      chooseRecipe(results[0]);
                    }
                    if (event.key === "Escape") setSearchOpen(false);
                  }}
                />
                {searchOpen && (
                  <div
                    id="recipe-search-results"
                    role="listbox"
                    aria-label={t("calculate.recipeResults")}
                    className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-xl"
                  >
                    {searching ? (
                      <div className="space-y-2 p-2" aria-label={t("common.loading")}>
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />
                        ))}
                      </div>
                    ) : searchError ? (
                      <p role="alert" className="p-5 text-center text-sm text-destructive">
                        {t("calculate.errorLoadRecipes")}
                      </p>
                    ) : results.length ? (
                      results.map((recipe) => (
                        <button
                          key={recipe.id}
                          type="button"
                          role="option"
                          aria-selected={selectedRecipe?.id === recipe.id}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => chooseRecipe(recipe)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{recipe.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[recipe.cuisine, recipe.family?.name || recipe.category, recipe.protein]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </div>
                          {selectedRecipe?.id === recipe.id && (
                            <Check className="size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="p-5 text-center text-sm text-muted-foreground">
                        {t("calculate.noRecipes")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedRecipe ? (
                <div className="flex gap-4 rounded-2xl border border-border bg-surface/60 p-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={recipeImage(selectedRecipe)}
                      alt={selectedRecipe.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 self-center">
                    <p className="font-extrabold">{selectedRecipe.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[selectedRecipe.cuisine, selectedRecipe.region].filter(Boolean).join(" • ") || selectedRecipe.category}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                      <span>{t("calculate.originalRecipe")}: {selectedRecipe.serving_size} {t("results.people")}</span>
                      {selectedRecipe.cook_time && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock3 className="size-3" /> {selectedRecipe.cook_time} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  {t("calculate.chooseHint")}
                </p>
              )}
            </div>

            <div className="space-y-5">
              <StepHeading number="2" title={t("calculate.howManyPeople")} />
              <div className="flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-12 rounded-2xl"
                  aria-label={t("calculate.decreasePeople")}
                  disabled={!validPeople || people <= MIN_PEOPLE}
                  onClick={() => updatePeople(people - 1)}
                >
                  <Minus className="size-5" />
                </Button>
                <div className="w-28 text-center">
                  <label htmlFor="people-count" className="sr-only">
                    {t("calculate.howManyPeople")}
                  </label>
                  <Input
                    id="people-count"
                    type="number"
                    min={MIN_PEOPLE}
                    max={MAX_PEOPLE}
                    inputMode="numeric"
                    aria-invalid={!validPeople}
                    className="h-16 rounded-2xl text-center text-3xl font-extrabold tabular-nums md:text-3xl"
                    value={peopleText}
                    onChange={(event) => {
                      setPeopleText(event.target.value);
                      setCalculation(null);
                      setCalculationError("");
                      setAppliedSubstitutions({});
                    }}
                  />
                  <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                    {t("results.people")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-12 rounded-2xl"
                  aria-label={t("calculate.increasePeople")}
                  disabled={!validPeople || people >= MAX_PEOPLE}
                  onClick={() => updatePeople(people + 1)}
                >
                  <Plus className="size-5" />
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-2" aria-label={t("calculate.quickPresets")}>
                {PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant={people === preset ? "default" : "outline"}
                    className="min-w-11 rounded-full"
                    aria-pressed={people === preset}
                    onClick={() => updatePeople(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              {!validPeople && (
                <p role="alert" className="text-center text-sm font-medium text-destructive">
                  {t("calculate.invalidPeople")}
                </p>
              )}
              {selectedRecipe && validPeople && (
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <Badge variant="outline">{t("calculate.originalServings")}: {selectedRecipe.serving_size}</Badge>
                  <Badge variant="outline">{t("calculate.calculatingFor")}: {people}</Badge>
                </div>
              )}
              <Button
                className="h-12 w-full rounded-full shadow-premium"
                size="lg"
                disabled={!selectedRecipe || !validPeople || calculating}
                onClick={handleCalculate}
              >
                <Users className="size-4" />
                {calculating ? t("calculate.calculating") : t("calculate.calculateIngredients")}
              </Button>
              {calculationError && (
                <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {calculationError}
                </p>
              )}
            </div>
          </div>
        </section>

        <div ref={resultsRef} className="scroll-mt-6 pt-8">
          {calculating ? (
            <IngredientTableSkeleton />
          ) : calculation ? (
            <AnimatePresence mode="wait">
              <motion.section
                key={`${calculation.recipe}-${calculation.people}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
                    {t("calculate.results")}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {calculation.recipe}
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    {t("calculate.ingredientsFor")} {calculation.people} {t("results.people")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary"><Users className="mr-1 size-3" />{calculation.people} {t("results.people")}</Badge>
                    <Badge variant="outline">{scale.toLocaleString(undefined, { maximumFractionDigits: 2 })}× {t("calculate.recipeScale")}</Badge>
                    <Badge variant="outline">{rows.length} {t("results.ingredients")}</Badge>
                  </div>
                </div>
                <IngredientResultsTable
                  ingredients={displayedRows}
                  people={calculation.people}
                  dishName={calculation.recipe}
                  onUndoSubstitution={(originalIngredient) => {
                    setAppliedSubstitutions((current) => {
                      const next = { ...current };
                      delete next[originalIngredient.toLowerCase()];
                      return next;
                    });
                  }}
                />
                {selectedRecipe && (
                  <SubstitutionAssistant
                    key={`${selectedRecipe.id}-${calculation.people}`}
                    recipeId={selectedRecipe.id}
                    servings={calculation.people}
                    ingredients={selectedRecipe.ingredients}
                    scaledIngredients={baseRows}
                    onApply={(substitution) => {
                      setAppliedSubstitutions((current) => ({
                        ...current,
                        [substitution.originalIngredient.toLowerCase()]: substitution,
                      }));
                      toast.success(t("substitution.applied"));
                    }}
                  />
                )}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button className="rounded-full sm:col-span-3" size="lg" onClick={addToShoppingList}>
                    <ShoppingCart className="size-4" />
                    {t("calculate.addShopping")}
                  </Button>
                  {selectedRecipe && (
                    <>
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href={`/recipe/${selectedRecipe.id}`}>
                          <BookOpen className="size-4" />
                          {t("calculate.viewRecipe")}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-full sm:col-span-2">
                        <Link href={`/recipe/${selectedRecipe.id}?servings=${calculation.people}#guided-cooking`}>
                          <ChefHat className="size-4" />
                          {t("calculate.startCooking")}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>
          ) : (
            <EmptyState
              icon={ChefHat}
              title={t("calculate.readyTitle")}
              description={t("calculate.readyDesc")}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function StepHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
        {number}
      </span>
      <h2 className="text-lg font-extrabold">{title}</h2>
    </div>
  );
}
