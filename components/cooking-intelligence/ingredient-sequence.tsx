import { ArrowRight, CirclePlus } from "lucide-react";
import type { CookingStepIngredient } from "@/types/api";

export function IngredientSequence({ ingredients }: { ingredients: CookingStepIngredient[] }) {
  if (!ingredients.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No new stored ingredient is added during this stage.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Add in this stage
      </p>
      {ingredients.map((ingredient, index) => (
        <div key={ingredient.id} className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <CirclePlus className="size-4 text-primary" />
            <p className="font-semibold">{ingredient.name}</p>
            <span className="ml-auto text-sm font-semibold text-primary">
              {ingredient.display}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{ingredient.why_now}</p>
          <div className="mt-2 flex items-center gap-2 text-xs font-medium">
            <span>{ingredient.expected_transformation.split("→")[0]}</span>
            <ArrowRight className="size-3.5 text-primary" />
            <span>{ingredient.expected_transformation.split("→").at(-1)}</span>
          </div>
          {index < ingredients.length - 1 && (
            <div className="mx-auto mt-3 h-3 w-px bg-primary/30" />
          )}
        </div>
      ))}
    </div>
  );
}
