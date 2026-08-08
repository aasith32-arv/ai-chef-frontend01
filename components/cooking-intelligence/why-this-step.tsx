import { Lightbulb } from "lucide-react";

export function WhyThisStep({ purpose, benefits }: { purpose: string; benefits: string[] }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex gap-2">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">Why this step?</p>
          <p className="mt-1 text-sm text-muted-foreground">{purpose}</p>
          {benefits.length > 0 && (
            <p className="mt-2 text-xs font-medium">Benefits: {benefits.join(" · ")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
