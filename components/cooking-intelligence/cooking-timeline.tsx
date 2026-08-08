import { Clock3 } from "lucide-react";
import type { CookingStepData } from "@/types/api";

export function CookingTimeline({ steps }: { steps: CookingStepData[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-start gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start">
            <div className="w-40 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <p className="flex items-center gap-1 text-xs font-bold text-primary">
                <Clock3 className="size-3.5" /> {step.timeline.start_minute}:00
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {step.timing.minimum_minutes}–{step.timing.maximum_minutes} min
              </p>
            </div>
            {index < steps.length - 1 && <div className="mt-6 h-px w-6 bg-primary/40" />}
          </div>
        ))}
      </div>
    </div>
  );
}
