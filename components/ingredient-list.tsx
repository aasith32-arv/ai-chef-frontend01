import type { ScaledIngredient } from "@/lib/ingredient-calculator";

type IngredientListProps = {
  ingredients: ScaledIngredient[];
  title?: string;
};

export function IngredientList({
  ingredients,
  title = "Ingredients",
}: IngredientListProps) {
  return (
    <section className="card-premium p-5 sm:p-6">
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      <ul className="mt-4 divide-y divide-border/70">
        {ingredients.map((item, index) => (
          <li
            key={item.name}
            className="flex items-center justify-between gap-4 py-3.5 text-sm"
          >
            <span className="flex items-center gap-3 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              {item.name}
            </span>
            <span className="text-base font-extrabold tabular-nums text-primary">
              {item.displayQuantity}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
