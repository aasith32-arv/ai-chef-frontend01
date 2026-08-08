import { Progress } from "@/components/ui/progress";

export function ColourProgress({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-xs">
        <span className="font-semibold">Colour progress</span>
        <span className="text-muted-foreground">Visual estimate</span>
      </div>
      <Progress value={value} className="h-2" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">
        Appearance may vary by ingredient, lighting and cookware.
      </p>
    </div>
  );
}
