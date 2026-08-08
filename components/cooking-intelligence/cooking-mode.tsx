"use client";

import { useState } from "react";
import { Check, ChefHat, HelpCircle, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CookingPlanData } from "@/types/api";
import { CookingProgress } from "./cooking-progress";
import { CookingSummary } from "./cooking-summary";
import { CookingWarning } from "./cooking-warning";
import { DonenessIndicator } from "./doneness-indicator";
import { HeatIndicator } from "./heat-indicator";
import { StepTimer } from "./step-timer";
import { TroubleshootingCard } from "./troubleshooting-card";
import { WhyThisStep } from "./why-this-step";

export function CookingMode({ plan }: { plan: CookingPlanData }) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const step = plan.steps[current];

  function next() {
    setShowHelp(false);
    if (current >= plan.steps.length - 1) {
      setCompleted(true);
    } else {
      setCurrent((value) => value + 1);
    }
  }

  function reset() {
    setCurrent(0);
    setCompleted(false);
    setShowHelp(false);
  }

  return (
    <Dialog onOpenChange={(open) => { if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full">
          <ChefHat /> Start Cooking Mode
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex h-[94dvh] max-h-[94dvh] w-[calc(100%-1rem)] max-w-3xl flex-col overflow-hidden p-0 sm:w-full"
      >
        <DialogHeader className="border-b border-border bg-card p-4 pr-14">
          <DialogTitle className="text-lg font-bold">Cooking Mode · {plan.recipe.name}</DialogTitle>
          <DialogDescription>
            Continue manually after checking the food. Timers never advance steps automatically.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3">
              <X /><span className="sr-only">Close cooking mode</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        {completed ? (
          <div className="flex flex-1 flex-col justify-center gap-6 overflow-y-auto p-5 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
              <Check className="size-8 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Cooking plan complete</h2>
              <p className="mt-2 text-muted-foreground">
                Do a final taste, texture and food-safety check before serving.
              </p>
            </div>
            <CookingSummary summary={plan.summary} />
            <DialogClose asChild><Button size="lg">Finish</Button></DialogClose>
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-surface/50 p-4">
              <CookingProgress current={current} total={plan.steps.length} />
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-primary">
                    STEP {step.step_number} / {plan.steps.length}
                  </span>
                  <HeatIndicator level={step.temperature.heat_level} />
                  <span className="text-xs text-muted-foreground">
                    {step.timing.minimum_minutes}–{step.timing.maximum_minutes} minutes
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight">{step.title}</h2>
                <p className="mt-2 text-base leading-relaxed">{step.instruction}</p>
                {plan.personalization.beginner_mode && (
                  <p className="mt-3 rounded-2xl bg-primary/5 p-3 text-sm text-muted-foreground">
                    {step.beginner_instruction}
                  </p>
                )}
              </div>

              {step.ingredients.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Add now</p>
                  <div className="mt-2 space-y-2">
                    {step.ingredients.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <span className="font-semibold">{item.name}</span>
                        <span className="font-bold text-primary">{item.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <StepTimer key={String(step.id)} minutes={step.timing.estimated_minutes} />
              <DonenessIndicator doneness={step.doneness} />
              <WhyThisStep purpose={step.purpose} benefits={step.benefits} />
              <CookingWarning warnings={step.warnings} />
              {showHelp && <TroubleshootingCard context={`${plan.recipe.name}: ${step.title}`} />}
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-border bg-card p-3 sm:flex sm:justify-end">
              <Button variant="outline" onClick={() => setShowHelp((value) => !value)}>
                <HelpCircle /> <span className="hidden sm:inline">Need help</span>
              </Button>
              <Button variant="outline" onClick={next}>
                <SkipForward /> Skip
              </Button>
              <Button onClick={next}>
                <Check /> <span className="hidden sm:inline">Done · Next</span>
                <span className="sm:hidden">Done</span>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
