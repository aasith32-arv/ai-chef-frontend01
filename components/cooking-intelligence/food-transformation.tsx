import { ArrowDown } from "lucide-react";
import type { CookingStepData } from "@/types/api";

export function FoodTransformation({
  transformation,
}: {
  transformation: CookingStepData["transformation"];
}) {
  const items = [
    ["Before", transformation.before],
    ["Process", transformation.process],
    ["After", transformation.after],
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
        Food transformation
      </p>
      <div className="space-y-2">
        {items.map(([label, text], index) => (
          <div key={label}>
            <div className="rounded-xl bg-surface px-3 py-2">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-sm">{text}</p>
            </div>
            {index < items.length - 1 && (
              <ArrowDown className="mx-auto my-1 size-4 text-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
