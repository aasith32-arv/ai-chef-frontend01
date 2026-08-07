import Image from "next/image";
import { Clock3, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "@/types/api";
import { recipeImage } from "@/lib/recipe-utils";

type RecipeHeaderProps = {
  recipe: Recipe;
  servings: number;
  servingsControl?: React.ReactNode;
  actions?: React.ReactNode;
};

export function RecipeHeader({
  recipe,
  servings,
  servingsControl,
  actions,
}: RecipeHeaderProps) {
  const image = recipeImage(recipe);
  const mins = 20 + (recipe.id % 7) * 5;

  return (
    <div className="card-premium overflow-hidden">
      <div className="relative h-56 sm:h-72 lg:h-80">
        <Image
          src={image}
          alt={recipe.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 900px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 space-y-3 p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-white/95 text-foreground">
              {recipe.category}
            </Badge>
            <Badge className="rounded-full bg-black/35 text-white backdrop-blur-sm">
              Serves {servings}
            </Badge>
            <Badge className="rounded-full bg-black/35 text-white backdrop-blur-sm">
              <Clock3 className="mr-1 size-3.5" />
              {mins} min
            </Badge>
            <Badge className="rounded-full bg-black/35 text-white backdrop-blur-sm">
              <Flame className="mr-1 size-3.5" />
              Medium
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {recipe.name}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {recipe.description || "No description available."}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        {servingsControl}
      </div>
    </div>
  );
}
