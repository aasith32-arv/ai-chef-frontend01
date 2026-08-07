"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock3, Flame } from "lucide-react";
import type { Recipe } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { recipeImage } from "@/lib/recipe-utils";
import { cn } from "@/lib/utils";

type RecipeCardProps = {
  recipe: Recipe;
  index?: number;
  className?: string;
  href?: string;
  matchPercent?: number;
};

export function RecipeCard({
  recipe,
  index = 0,
  className,
  href,
  matchPercent,
}: RecipeCardProps) {
  const to = href || `/recipe/${recipe.id}`;
  const mins = 20 + (recipe.id % 7) * 5;
  const calories = 280 + recipe.serving_size * 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn("h-full", className)}
    >
      <Link
        href={to}
        className="group card-premium block h-full overflow-hidden transition-shadow hover:shadow-float"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={recipeImage(recipe)}
            alt={recipe.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <Badge className="absolute left-3 top-3 rounded-full bg-white/95 text-foreground shadow-sm">
            {recipe.category}
          </Badge>
          {typeof matchPercent === "number" && (
            <Badge className="absolute right-3 top-3 rounded-full bg-primary text-primary-foreground">
              {Math.round(matchPercent)}% match
            </Badge>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-xs font-medium text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-sm">
              <Clock3 className="size-3.5" />
              {mins} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-sm">
              <Flame className="size-3.5" />
              {calories} kcal
            </span>
          </div>
        </div>
        <div className="space-y-2 p-4 sm:p-5">
          <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {recipe.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {recipe.description || "Premium recipe scaled for any guest count."}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
            Serves {recipe.serving_size} · {recipe.ingredients?.length || 0}{" "}
            ingredients
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
