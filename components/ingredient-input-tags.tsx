"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

type IngredientInputTagsProps = {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
};

export function IngredientInputTags({
  value,
  onChange,
  suggestions = [
    "Rice",
    "Chicken",
    "Egg",
    "Onion",
    "Tomato",
    "Garlic",
    "Coconut Milk",
    "Carrot",
  ],
}: IngredientInputTagsProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    const exists = value.some(
      (item) => item.toLowerCase() === tag.toLowerCase()
    );
    if (exists) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft.replace(/,/g, ""));
    }
    if (e.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium" htmlFor="ingredient-tags">
        {t("suggest.ingredientsLabel")}
      </label>
      <div className="glass-3d rounded-3xl border border-white/60 p-4">
        <div className="mb-3 flex min-h-10 flex-wrap gap-2">
          {value.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("suggest.ingredientsHint")}
            </p>
          )}
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-white/20"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="ingredient-tags"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              value.length
                ? t("suggest.addAnother")
                : t("suggest.typeIngredient")
            }
            className="h-11 rounded-2xl border-border/70 bg-white/70"
          />
          <Button
            type="button"
            className="h-11 shrink-0 rounded-2xl px-4 shadow-md"
            onClick={() => addTag(draft)}
            aria-label={t("suggest.addIngredient")}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions
          .filter(
            (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
          )
          .map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={cn(
                "rounded-full border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-medium",
                "shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              )}
            >
              + {suggestion}
            </button>
          ))}
      </div>
    </div>
  );
}
