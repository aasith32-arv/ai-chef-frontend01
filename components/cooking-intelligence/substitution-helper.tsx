"use client";

import { useState } from "react";
import { Loader2, Replace } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSubstitutions } from "@/services/cooking";
import type { CookingIngredient, SubstitutionResult } from "@/types/api";

export function SubstitutionHelper({
  recipeId,
  ingredients,
}: {
  recipeId: number;
  ingredients: CookingIngredient[];
}) {
  const [ingredient, setIngredient] = useState(ingredients[0]?.name || "");
  const [result, setResult] = useState<SubstitutionResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!ingredient) return;
    setLoading(true);
    try {
      setResult(await getSubstitutions(ingredient, recipeId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 font-bold">
        <Replace className="size-4 text-primary" /> Missing an ingredient?
      </h3>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Select value={ingredient} onValueChange={setIngredient}>
          <SelectTrigger className="h-9 w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ingredients.map((item) => (
              <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={search} disabled={loading || !ingredient}>
          {loading ? <Loader2 className="animate-spin" /> : <Replace />} Find substitution
        </Button>
      </div>
      {result && (
        <div className="mt-3 space-y-2 text-sm">
          {result.options.length ? result.options.map((option) => (
            <div key={option.substitution} className="rounded-xl bg-surface p-3">
              <p className="font-bold">{option.substitution}</p>
              <p className="mt-1 text-muted-foreground">{option.why_it_works}</p>
              <p className="mt-1"><b>Amount:</b> {option.how_much}</p>
              <p><b>Changes:</b> {option.what_changes}</p>
            </div>
          )) : <p className="text-muted-foreground">{result.context_warning}</p>}
          {result.options.length > 0 && (
            <p className="text-xs text-muted-foreground">{result.context_warning}</p>
          )}
        </div>
      )}
    </div>
  );
}
