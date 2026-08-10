"use client";

import type { ScaledIngredient } from "@/lib/ingredient-calculator";
import { useLanguage } from "@/providers/language-provider";

type IngredientResultsTableProps = {
  ingredients: Array<ScaledIngredient & { substitutedFor?: string }>;
  people: number;
  dishName: string;
  onUndoSubstitution?: (originalIngredient: string) => void;
};

export function IngredientResultsTable({
  ingredients,
  people,
  dishName,
  onUndoSubstitution,
}: IngredientResultsTableProps) {
  const { t } = useLanguage();

  return (
    <div className="card-premium overflow-hidden">
      <div className="border-b border-border bg-surface/60 px-4 py-4 sm:px-5">
        <h2 className="text-xl font-extrabold tracking-tight">
          {t("results.ingredients")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dishName} {t("results.scaledFor")} {people}{" "}
          {people === 1 ? t("results.person") : t("results.people")}
        </p>
      </div>
      <div className="divide-y divide-border sm:hidden">
        {ingredients.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="min-w-0 font-semibold">
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {index + 1}
              </span>
              {item.name}
              {item.substitutedFor && (
                <div className="ml-8 mt-1 text-xs font-normal text-muted-foreground">
                  {t("substitution.substitutedFor")} {item.substitutedFor}
                  {onUndoSubstitution && (
                    <button
                      type="button"
                      className="ml-2 font-bold text-primary hover:underline"
                      onClick={() => onUndoSubstitution(item.substitutedFor!)}
                    >
                      {t("substitution.undo")}
                    </button>
                  )}
                </div>
              )}
            </div>
            <strong className="shrink-0 text-right text-primary tabular-nums">
              {item.displayQuantity}
            </strong>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                {t("results.ingredient")}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                {t("results.quantity")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((item, index) => (
              <tr
                key={item.name}
                className="border-t border-border/70 transition-colors hover:bg-primary/5"
              >
                <td className="px-4 py-3.5 font-semibold text-foreground sm:px-5">
                  <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {index + 1}
                  </span>
                  {item.name}
                  {item.substitutedFor && (
                    <div className="ml-8 mt-1 text-xs font-normal text-muted-foreground">
                      {t("substitution.substitutedFor")} {item.substitutedFor}
                      {onUndoSubstitution && (
                        <button
                          type="button"
                          className="ml-2 font-bold text-primary hover:underline"
                          onClick={() => onUndoSubstitution(item.substitutedFor!)}
                        >
                          {t("substitution.undo")}
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-base font-extrabold tabular-nums text-primary sm:px-5">
                  {item.displayQuantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
