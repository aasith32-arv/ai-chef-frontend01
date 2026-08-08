import { Progress } from "@/components/ui/progress";

export function CookingProgress({ current, total }: { current: number; total: number }) {
  const value = total ? (current / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold">
        <span>Step {Math.min(current + 1, total)} of {total}</span>
        <span>{Math.round(value)}% complete</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
