"use client";

import type { ScaledIngredient } from "@/lib/ingredient-calculator";
import { useLanguage } from "@/providers/language-provider";

type IngredientResultsTableProps = {
  ingredients: ScaledIngredient[];
  people: number;
  dishName: string;
};

export function IngredientResultsTable({
  ingredients,
  people,
  dishName,
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-sm">
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
