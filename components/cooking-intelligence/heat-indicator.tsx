import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeatIndicator({ level }: { level: string }) {
  return (
    <Badge variant="outline" className="gap-1 rounded-full">
      <Flame className="size-3.5 text-primary" />
      {level}
    </Badge>
  );
}
