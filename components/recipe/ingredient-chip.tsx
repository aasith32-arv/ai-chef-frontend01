"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type IngredientChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
};

export function IngredientChip({ label, onRemove, className }: IngredientChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary",
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-primary/15"
          aria-label={`Remove ${label}`}
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}
