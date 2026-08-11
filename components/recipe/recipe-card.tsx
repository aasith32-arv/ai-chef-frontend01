"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock3, Flame, Gauge, MapPin, Utensils } from "lucide-react";
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
  const mins =
    typeof recipe.prep_time === "number" || typeof recipe.cook_time === "number"
      ? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
      : 20 + (recipe.id % 7) * 5;

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
              {recipe.spice_level || recipe.difficulty || "Medium"}
            </span>
          </div>
        </div>
        <div className="space-y-2 p-4 sm:p-5">
          <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {recipe.name}
          </h3>
          {(recipe.cuisine || recipe.region) && <p className="flex items-center gap-1.5 text-xs font-semibold text-primary"><MapPin className="size-3.5" />{[recipe.cuisine, recipe.region].filter(Boolean).join(" · ")}</p>}
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {recipe.description || "Premium recipe scaled for any guest count."}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Utensils className="size-3.5 text-primary" />{recipe.protein && recipe.protein !== "None" ? recipe.protein : recipe.diet_type || "Vegetarian"}</span>
            <span className="inline-flex items-center gap-1.5"><Gauge className="size-3.5 text-primary" />{recipe.difficulty || "Easy"}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-primary" />{recipe.cook_time ?? mins} min cook</span>
            <span className="inline-flex items-center gap-1.5"><Flame className="size-3.5 text-primary" />{recipe.spice_level || "Medium"}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
