import { AlertTriangle } from "lucide-react";

export function CookingWarning({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-2xl border border-warning/35 bg-warning/10 p-3">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <div>
          <p className="font-semibold">Watch out</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
