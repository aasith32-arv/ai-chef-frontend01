import { AlertTriangle, Clock3, CookingPot, Flame, ListChecks, Salad } from "lucide-react";
import type { CookingPlanData } from "@/types/api";

export function CookingSummary({ summary }: { summary: CookingPlanData["summary"] }) {
  const items = [
    ["Cooking time", `${summary.estimated_minutes} min`, Clock3],
    ["Difficulty", summary.difficulty, CookingPot],
    ["Stages", String(summary.stages), ListChecks],
    ["Ingredients", String(summary.ingredients), Salad],
    ["Heat profile", summary.heat_profile, Flame],
    ["Critical steps", String(summary.critical_steps), AlertTriangle],
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value, Icon]) => (
        <div key={label} className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
            <Icon className="size-4 text-primary" /> {label}
          </p>
          <p className="mt-2 font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
