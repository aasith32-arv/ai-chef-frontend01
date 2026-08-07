"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Circle, ShoppingCart, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  clearCheckedShoppingItems,
  clearShoppingList,
  getShoppingList,
  removeShoppingItem,
  subscribeShoppingList,
  toggleShoppingItem,
  type ShoppingListItem,
} from "@/lib/shopping-list";
import { cn } from "@/lib/utils";

const EMPTY_LIST: ShoppingListItem[] = [];

function useShoppingList(): ShoppingListItem[] {
  return useSyncExternalStore(
    subscribeShoppingList,
    getShoppingList,
    () => EMPTY_LIST
  );
}

export default function ShoppingListPage() {
  const items = useShoppingList();
  const remaining = items.filter((item) => !item.checked).length;

  return (
    <div className="container-premium py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Shopping list
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length
              ? `${remaining} item${remaining === 1 ? "" : "s"} left to buy`
              : "Add scaled ingredients from Calculate or any recipe."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/calculate">Add from calculator</Link>
          </Button>
          {items.some((item) => item.checked) && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => clearCheckedShoppingItems()}
            >
              <Check className="size-4" />
              Clear checked
            </Button>
          )}
          {items.length > 0 && (
            <Button
              variant="ghost"
              className="rounded-full text-destructive"
              onClick={() => clearShoppingList()}
            >
              <Trash2 className="size-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {!items.length ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your list is empty"
          description="Generate quantities on Calculate, then tap Add to shopping list."
        />
      ) : (
        <ul className="mx-auto max-w-2xl space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm transition-opacity",
                item.checked && "opacity-55"
              )}
            >
              <button
                type="button"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                  item.checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary"
                )}
                aria-pressed={item.checked}
                aria-label={`Mark ${item.name} as ${item.checked ? "needed" : "bought"}`}
                onClick={() => toggleShoppingItem(item.id)}
              >
                {item.checked ? (
                  <Check className="size-4" />
                ) : (
                  <Circle className="size-4 opacity-40" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold",
                    item.checked && "line-through"
                  )}
                >
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                  {item.dish ? ` · ${item.dish}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                aria-label={`Remove ${item.name}`}
                onClick={() => removeShoppingItem(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
