import { Badge } from "@/components/ui/badge";
import type { CookingPlanData } from "@/types/api";
import { CookingMode } from "./cooking-mode";
import { CookingStep } from "./cooking-step";
import { CookingSummary } from "./cooking-summary";
import { CookingTimeline } from "./cooking-timeline";
import { SubstitutionHelper } from "./substitution-helper";
import { TroubleshootingCard } from "./troubleshooting-card";

export function CookingPlan({ plan }: { plan: CookingPlanData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight">AI Cooking Intelligence</h2>
            <Badge variant="outline">
              {plan.source === "stored" ? "Verified stored plan" : "Rule-based guidance"}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            A guided sequence with timing, heat, visual cues, transformations and recovery help.
          </p>
        </div>
        <CookingMode plan={plan} />
      </div>

      <CookingSummary summary={plan.summary} />
      <div className="rounded-2xl border border-border bg-surface/60 p-3 text-xs text-muted-foreground">
        {plan.estimate_notice}
      </div>
      {plan.personalization_notes.map((note) => (
        <div
          key={note.message}
          className={note.level === "warning"
            ? "rounded-2xl border border-warning/40 bg-warning/10 p-3 text-sm"
            : "rounded-2xl border border-border bg-surface p-3 text-sm"}
        >
          {note.message}
        </div>
      ))}

      <section className="space-y-3">
        <h3 className="text-lg font-bold">Cooking timeline</h3>
        <CookingTimeline steps={plan.steps} />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">Guided cooking plan</h3>
        {plan.steps.map((step) => (
          <CookingStep
            key={step.id}
            step={step}
            beginnerMode={plan.personalization.beginner_mode}
            scienceMode={plan.personalization.science_mode}
          />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <TroubleshootingCard context={plan.recipe.name} />
        <SubstitutionHelper recipeId={plan.recipe.id} ingredients={plan.ingredients} />
      </div>
    </div>
  );
}
