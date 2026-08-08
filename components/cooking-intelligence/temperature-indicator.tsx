import { Thermometer } from "lucide-react";
import { HeatIndicator } from "./heat-indicator";
import type { CookingStepData } from "@/types/api";

export function TemperatureIndicator({
  temperature,
}: {
  temperature: CookingStepData["temperature"];
}) {
  const range =
    temperature.minimum_c == null || temperature.maximum_c == null
      ? "Use observable cues"
      : `${temperature.minimum_c}–${temperature.maximum_c}°C`;
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Thermometer className="size-4 text-primary" />
        <span className="font-semibold">Temperature</span>
        <HeatIndicator level={temperature.heat_level} />
      </div>
      <p className="font-semibold">{range}</p>
      <p className="mt-1 text-xs text-muted-foreground">{temperature.reason}</p>
    </div>
  );
}
