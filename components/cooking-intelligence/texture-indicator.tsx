import { Hand } from "lucide-react";

export function TextureIndicator({ cue }: { cue: string }) {
  return (
    <div className="flex gap-2 rounded-xl bg-muted/60 p-3">
      <Hand className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-bold uppercase tracking-wide">Texture</p>
        <p className="mt-1 text-sm text-muted-foreground">{cue}</p>
      </div>
    </div>
  );
}
