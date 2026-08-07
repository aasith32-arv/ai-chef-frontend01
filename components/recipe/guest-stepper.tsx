"use client";

import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type GuestStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function GuestStepper({
  value,
  onChange,
  min = 1,
  max = 200,
  className,
}: GuestStepperProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="size-4 text-primary" />
          Guests
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 rounded-2xl"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="Decrease guests"
        >
          <Minus className="size-4" />
        </Button>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={1}
          onValueChange={(vals) => onChange(vals[0] ?? value)}
          className="flex-1"
          aria-label="Guest count"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 rounded-2xl"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="Increase guests"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
