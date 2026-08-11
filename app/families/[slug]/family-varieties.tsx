"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import type { DishFamily, Recipe } from "@/types/api";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { EmptyState } from "@/components/empty-state";
import { RecipeGridSkeleton } from "@/components/loading-skeletons";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDishFamilyRecipes } from "@/services/dish-families";
import { useLanguage } from "@/providers/language-provider";
import { filterRecipeVarieties } from "@/lib/discovery";

const ALL = "__all__";

export function FamilyVarieties({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const [family, setFamily] = useState<DishFamily | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState(ALL);
  const [protein, setProtein] = useState(ALL);
  const [difficulty, setDifficulty] = useState(ALL);
  const [spice, setSpice] = useState(ALL);

  useEffect(() => {
    let active = true;
    getDishFamilyRecipes(slug, { page: 1, per_page: 100 })
      .then((data) => {
        if (!active) return;
        setFamily(data.family);
        setRecipes(data.items);
      })
      .catch(() => {
        if (active) {
          setFamily(null);
          setRecipes([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const options = (field: "cuisine" | "protein" | "difficulty" | "spice_level") =>
    Array.from(new Set(recipes.map((item) => item[field]).filter(Boolean) as string[])).sort();

  const filtered = useMemo(() => {
    return filterRecipeVarieties(recipes, {
      search: query,
      cuisine: cuisine === ALL ? undefined : cuisine,
      protein: protein === ALL ? undefined : protein,
      difficulty: difficulty === ALL ? undefined : difficulty,
      spiceLevel: spice === ALL ? undefined : spice,
    });
  }, [recipes, query, cuisine, protein, difficulty, spice]);

  if (loading) return <div className="container-premium py-12"><RecipeGridSkeleton count={8} /></div>;
  if (!family) return <div className="container-premium py-12"><EmptyState icon={Search} title={t("discovery.familyNotFound")} description={t("discovery.tryAnother")} /></div>;

  return (
    <div className="container-premium space-y-8 py-10 sm:py-14">
      <Link href={`/families?category=${encodeURIComponent(family.category)}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
        <ArrowLeft className="size-4" /> {t("discovery.backToFamilies")}
      </Link>
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-11">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_center,rgb(249_115_22_/_0.16),transparent_68%)] sm:block" aria-hidden />
        <div className="relative max-w-3xl space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{family.category} · {recipes.length} {t("discovery.varieties").toLowerCase()}</p>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">{family.name}<span className="sr-only"> {t("discovery.varieties")}</span></h1>
          <p className="text-lg font-semibold text-foreground">Explore authentic {family.name.toLowerCase()} varieties</p>
          {family.description && <p className="max-w-2xl leading-7 text-muted-foreground">{family.description}</p>}
        </div>
      </header>

      <div className="grid gap-3 rounded-3xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("discovery.searchVarieties")} className="h-10 rounded-xl" />
        <FilterSelect label={t("discovery.cuisine")} value={cuisine} onChange={setCuisine} items={options("cuisine")} />
        <FilterSelect label={t("discovery.protein")} value={protein} onChange={setProtein} items={options("protein")} />
        <FilterSelect label={t("discovery.difficulty")} value={difficulty} onChange={setDifficulty} items={options("difficulty")} />
        <FilterSelect label={t("discovery.spiceLevel")} value={spice} onChange={setSpice} items={options("spice_level")} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div><h2 className="text-2xl font-extrabold">Choose your {family.name.toLowerCase()}</h2><p className="mt-1 text-sm text-muted-foreground">Open a variety to view its recipe, scale ingredients, and start Guided Cooking.</p></div>
        <p className="shrink-0 text-sm font-semibold text-muted-foreground">{filtered.length} {t("discovery.varieties").toLowerCase()}</p>
      </div>
      {filtered.length ? (
        <div data-testid="variety-grid" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, index) => <RecipeCard key={item.id} recipe={item} index={index} />)}
        </div>
      ) : (
        <EmptyState icon={Search} title={t("discovery.noResults")} description={t("discovery.tryFilters")} />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, items }: { label: string; value: string; onChange: (value: string) => void; items: string[] }) {
  const { t } = useLanguage();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("discovery.all")} {label}</SelectItem>
        {items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
