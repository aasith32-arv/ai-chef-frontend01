"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Recipe } from "@/types/api";
import { AiAssistantBanner } from "@/components/home/ai-assistant-banner";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { Button } from "@/components/ui/button";
import {
  getRecentRecipes,
  subscribeRecentRecipes,
  type RecentRecipe,
} from "@/lib/recent-recipes";
import { fadeUp, staggerContainer, staggerDelay } from "@/lib/motion";
import { DISCOVERY_CATEGORIES } from "@/lib/discovery";
import { useLanguage } from "@/providers/language-provider";

const emptyRecent: RecentRecipe[] = [];

type HomeSectionsProps = {
  recipes: Recipe[];
};

export function CategoryStrip() {
  const { t } = useLanguage();
  return (
    <section className="container-premium">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t("discovery.foodCategories")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("discovery.chooseCategory")}
        </p>
      </div>
      <motion.div
        className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {DISCOVERY_CATEGORIES.map((cat, index) => (
          <motion.div
            key={cat.value}
            variants={fadeUp}
            transition={staggerDelay(index)}
          >
            <Link
              href={`/families?category=${encodeURIComponent(cat.value)}`}
              className="flex min-w-[118px] flex-col items-center gap-2 rounded-3xl border border-border bg-card px-4 py-4 shadow-premium transition-transform hover:-translate-y-1"
            >
              <span className="text-2xl" aria-hidden>
                {cat.emoji}
              </span>
              <span className="text-sm font-bold">{t(cat.labelKey)}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function RecipeShowcase({
  title,
  subtitle,
  recipes,
  actionHref = "/calculate",
  actionLabel = "See all",
}: {
  title: string;
  subtitle: string;
  recipes: Recipe[];
  actionHref?: string;
  actionLabel?: string;
}) {
  if (!recipes.length) return null;

  return (
    <section className="container-premium">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={index} />
        ))}
      </div>
    </section>
  );
}

function RecentlyViewedSection() {
  const recent = useSyncExternalStore(
    subscribeRecentRecipes,
    getRecentRecipes,
    () => emptyRecent
  );

  if (!recent.length) return null;

  const asRecipes = recent.map(
    (item) =>
      ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: null,
        serving_size: item.serving_size,
        steps: [],
        image: item.image,
        slug: null,
        family_id: null,
        family: null,
        cuisine: null,
        region: null,
        protein: null,
        diet_type: null,
        difficulty: null,
        prep_time: null,
        cook_time: null,
        spice_level: null,
        tags: [],
        publication_status: "published",
        created_at: "",
        updated_at: "",
        ingredients: [],
      }) satisfies Recipe
  );

  return (
    <RecipeShowcase
      title="Recently viewed"
      subtitle="Pick up where you left off"
      recipes={asRecipes}
      actionHref="/calculate"
      actionLabel="Calculate"
    />
  );
}

export function QuickCalculateCta() {
  return (
    <section className="container-premium">
      <div className="card-premium overflow-hidden bg-surface p-6 sm:p-8 md:flex md:items-center md:justify-between md:gap-8">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Quick calculate
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Pick a dish, set guests, and get scaled shopping quantities with
            cooking steps instantly.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
          <Button asChild size="lg" className="rounded-full shadow-premium">
            <Link href="/calculate">Start calculating</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/shopping-list">Shopping list</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function HomeSections({ recipes }: HomeSectionsProps) {
  const popular = recipes.slice(0, 4);
  const featured = recipes.slice(0, 8);
  const seasonal = [...recipes]
    .sort((a, b) => a.category.localeCompare(b.category))
    .slice(0, 4);

  return (
    <div className="space-y-14 py-12 sm:space-y-16 sm:py-16">
      <AiAssistantBanner />
      <CategoryStrip />
      <RecentlyViewedSection />
      <RecipeShowcase
        title="Popular recipes"
        subtitle="Crowd favorites ready to scale"
        recipes={popular}
      />
      <RecipeShowcase
        title="Seasonal picks"
        subtitle="Balanced variety across categories"
        recipes={seasonal}
      />
      <QuickCalculateCta />
      <RecipeShowcase
        title="Featured meals"
        subtitle="Beautiful dishes for any guest count"
        recipes={featured}
        actionHref="/suggest"
        actionLabel="Suggest more"
      />
    </div>
  );
}
