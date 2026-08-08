import { Eye } from "lucide-react";
import type { CookingStepData } from "@/types/api";
import { AromaIndicator } from "./aroma-indicator";
import { ColourProgress } from "./colour-progress";
import { TextureIndicator } from "./texture-indicator";

export function DonenessIndicator({
  doneness,
}: {
  doneness: CookingStepData["doneness"];
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border p-3">
      <div className="flex gap-2">
        <Eye className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide">Look for</p>
          <p className="mt-1 text-sm text-muted-foreground">{doneness.visual_cue}</p>
        </div>
      </div>
      <ColourProgress value={doneness.colour_progress} label={doneness.colour_stage} />
      <div className="grid gap-2 sm:grid-cols-2">
        <TextureIndicator cue={doneness.texture_cue} />
        <AromaIndicator cue={doneness.aroma_cue} />
      </div>
    </div>
  );
}
