"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Recipe } from "@/types/api";
import { POPULAR_DISHES } from "@/lib/popular-dishes";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DishSelectorProps = {
  recipes: Recipe[];
  value: string;
  onChange: (dishName: string, recipe?: Recipe | null) => void;
  disabled?: boolean;
};

export function DishSelector({
  recipes,
  value,
  onChange,
  disabled,
}: DishSelectorProps) {
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Recipe[]>();
    for (const recipe of recipes) {
      const list = map.get(recipe.category) ?? [];
      list.push(recipe);
      map.set(recipe.category, list);
    }
    return Array.from(map.entries());
  }, [recipes]);

  const selectedRecipe = recipes.find(
    (r) => r.name.toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="dish-selector">
          Dish
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="dish-selector"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a dish"
              disabled={disabled}
              className="h-11 w-full justify-between rounded-xl font-normal"
            >
              {value ? (
                <span className="flex items-center gap-2 truncate">
                  {value}
                  {selectedRecipe && (
                    <Badge variant="secondary" className="rounded-md">
                      {selectedRecipe.category}
                    </Badge>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Search or pick a dish…
                </span>
              )}
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search biryani, kottu, rice…" />
              <CommandList>
                <CommandEmpty>No dish found — type a custom name below.</CommandEmpty>
                <CommandGroup heading="Popular">
                  {POPULAR_DISHES.map((name) => (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        const match = recipes.find(
                          (r) => r.name.toLowerCase() === name.toLowerCase()
                        );
                        onChange(name, match ?? null);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "size-4",
                          value === name ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden
                      />
                      {name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {grouped.map(([category, items]) => (
                  <CommandGroup key={category} heading={category}>
                    {items.map((recipe) => (
                      <CommandItem
                        key={recipe.id}
                        value={[
                          recipe.name,
                          recipe.category,
                          recipe.family?.name,
                          recipe.cuisine,
                          recipe.region,
                          recipe.protein,
                          ...(recipe.tags ?? []),
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onSelect={() => {
                          onChange(recipe.name, recipe);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            value === recipe.name ? "opacity-100" : "opacity-0"
                          )}
                          aria-hidden
                        />
                        {recipe.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="custom-dish">
          Or type any dish for AI
        </label>
        <Input
          id="custom-dish"
          className="h-11 rounded-xl"
          placeholder="e.g. Mutton Biryani, Seafood Kottu…"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value, null)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {POPULAR_DISHES.slice(0, 6).map((name) => (
          <button
            key={name}
            type="button"
            disabled={disabled}
            onClick={() => {
              const match = recipes.find(
                (r) => r.name.toLowerCase() === name.toLowerCase()
              );
              onChange(name, match ?? null);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              value === name
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
