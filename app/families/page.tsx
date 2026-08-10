"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { DishFamily, Recipe } from "@/types/api";
import { DishFamilyCard } from "@/components/discovery/dish-family-card";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { EmptyState } from "@/components/empty-state";
import { RecipeGridSkeleton } from "@/components/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DISCOVERY_CATEGORIES } from "@/lib/discovery";
import { getDishFamilies } from "@/services/dish-families";
import { getRecipes } from "@/services/recipes";
import { useLanguage } from "@/providers/language-provider";

export default function FamiliesPage() {
  return (
    <Suspense fallback={<div className="container-premium py-12"><RecipeGridSkeleton /></div>}>
      <FamilyBrowser />
    </Suspense>
  );
}

function FamilyBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const [query, setQuery] = useState(search);
  const requestKey = `${category}\u0000${search}`;
  const [result, setResult] = useState<{
    key: string;
    families: DishFamily[];
    recipes: Recipe[];
    failed: boolean;
  }>({ key: "", families: [], recipes: [], failed: false });
  const loading = result.key !== requestKey;
  const families = loading ? [] : result.families;
  const recipes = loading ? [] : result.recipes;
  const failed = !loading && result.failed;

  useEffect(() => {
    let active = true;
    Promise.all([
      getDishFamilies({ category: category || undefined, search: search || undefined }),
      search
        ? getRecipes({ search, category: category || undefined, page: 1, per_page: 24 })
        : Promise.resolve(null),
    ])
      .then(([familyData, recipeData]) => {
        if (!active) return;
        setResult({
          key: requestKey,
          families: familyData.items,
          recipes: recipeData?.items ?? [],
          failed: false,
        });
      })
      .catch(() => {
        if (!active) return;
        setResult({ key: requestKey, families: [], recipes: [], failed: true });
      });
    return () => {
      active = false;
    };
  }, [category, search, requestKey]);

  const heading = useMemo(() => {
    if (search) return `${t("discovery.resultsFor")} “${search}”`;
    if (category) return category;
    return t("discovery.foodFamilies");
  }, [category, search, t]);

  function navigate(nextCategory: string, nextSearch = search) {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    const queryString = params.toString();
    router.push(`/families${queryString ? `?${queryString}` : ""}`);
  }

  return (
    <div className="container-premium space-y-10 py-10 sm:py-14">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          {t("discovery.browse")}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{heading}</h1>
        <p className="text-muted-foreground">{t("discovery.subtitle")}</p>
      </header>

      <form
        className="flex max-w-2xl gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(category, query);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("discovery.searchPlaceholder")}
            aria-label={t("discovery.search")}
            className="h-11 rounded-full pl-10"
          />
        </div>
        <Button type="submit" className="h-11 rounded-full px-6">{t("discovery.search")}</Button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => navigate("")}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
        >
          {t("discovery.allCategories")}
        </button>
        {DISCOVERY_CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => navigate(item.value)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${category === item.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
          >
            <span aria-hidden>{item.emoji}</span> {t(item.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <RecipeGridSkeleton count={6} />
      ) : failed ? (
        <EmptyState icon={Search} title={t("discovery.loadError")} description={t("discovery.loadErrorHelp")} />
      ) : (
        <>
          {families.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-extrabold">{t("discovery.foodFamilies")}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {families.map((family, index) => (
                  <DishFamilyCard key={family.id} family={family} eager={index < 3} />
                ))}
              </div>
            </section>
          )}
          {search && recipes.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-extrabold">{t("discovery.recipeVarieties")}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} />)}
              </div>
            </section>
          )}
          {!families.length && !recipes.length && (
            <EmptyState icon={Search} title={t("discovery.noResults")} description={t("discovery.tryAnother")} />
          )}
        </>
      )}
    </div>
  );
}
