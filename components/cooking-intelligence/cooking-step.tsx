import { ChevronDown, Clock3, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CookingStepData } from "@/types/api";
import { CookingWarning } from "./cooking-warning";
import { DonenessIndicator } from "./doneness-indicator";
import { FoodTransformation } from "./food-transformation";
import { IngredientSequence } from "./ingredient-sequence";
import { TemperatureIndicator } from "./temperature-indicator";
import { WhyThisStep } from "./why-this-step";

export function CookingStep({
  step,
  beginnerMode,
  scienceMode,
}: {
  step: CookingStepData;
  beginnerMode: boolean;
  scienceMode: boolean;
}) {
  return (
    <details className="group rounded-3xl border border-border bg-card shadow-sm open:shadow-premium">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
          {String(step.step_number).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold sm:text-base">{step.title}</h3>
            {step.critical && <Badge variant="destructive">Critical</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {step.timing.minimum_minutes}–{step.timing.maximum_minutes} min
            </span>
            <span>{step.temperature.heat_level} heat</span>
            <span>Starts around {step.timeline.start_minute} min</span>
          </div>
        </div>
        <ChevronDown className="mt-2 size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-4 border-t border-border p-4 sm:p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Instruction
            </p>
            <p className="mt-1 text-base leading-relaxed">{step.instruction}</p>
            {beginnerMode && (
              <p className="mt-2 rounded-xl bg-surface p-3 text-sm text-muted-foreground">
                Beginner tip: {step.beginner_instruction}
              </p>
            )}
          </div>
          <IngredientSequence ingredients={step.ingredients} />
          <WhyThisStep purpose={step.purpose} benefits={step.benefits} />
          <CookingWarning warnings={step.warnings} />
        </div>
        <div className="space-y-4">
          <TemperatureIndicator temperature={step.temperature} />
          <DonenessIndicator doneness={step.doneness} />
          <FoodTransformation transformation={step.transformation} />
          {scienceMode && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <p className="flex items-center gap-2 font-semibold">
                <FlaskConical className="size-4 text-primary" /> Cooking science
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.scientific_explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
