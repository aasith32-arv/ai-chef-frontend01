"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import {
  Check,
  ChefHat,
  Circle,
  Download,
  ListChecks,
  Plus,
  ReceiptText,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addShoppingItems,
  clearCheckedShoppingItems,
  clearShoppingList,
  getShoppingList,
  removeShoppingItem,
  subscribeShoppingList,
  toggleShoppingItem,
  type ShoppingListItem,
} from "@/lib/shopping-list";
import { downloadShoppingListPdf, groupShoppingItems } from "@/lib/shopping-list-pdf";
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
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [formError, setFormError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const bought = items.filter((item) => item.checked).length;
  const remaining = items.length - bought;
  const progress = items.length ? Math.round((bought / items.length) * 100) : 0;
  const recipeGroups = useMemo(() => groupShoppingItems(items), [items]);

  function addExtraItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = itemName.trim();
    const amount = quantity.trim();

    if (!name) {
      setFormError("Enter an item name.");
      return;
    }

    addShoppingItems([{ name, quantity: amount || "1" }]);
    setItemName("");
    setQuantity("1");
    setFormError("");
  }

  async function downloadPdf() {
    if (!items.length || downloadingPdf) return;
    setDownloadingPdf(true);
    setPdfError("");
    try {
      await downloadShoppingListPdf(items);
    } catch {
      setPdfError("The PDF could not be created. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <main className="container-premium py-8 sm:py-12">
      <header className="mx-auto mb-8 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShoppingCart className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Your market trip
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Shopping list
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Check off items as you pick them, add anything extra, and keep your whole trip on one tidy bill.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-premium">
          <div className="border-b border-dashed border-border bg-surface/60 px-5 py-5 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ReceiptText className="size-5 text-primary" />
                <div>
                  <h2 className="font-extrabold">AI Chef Market List</h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} total · {remaining} left to pick
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {progress}% picked
              </span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Shopping progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!items.length ? (
            <div className="px-5 py-10 sm:px-7">
              <EmptyState
                icon={ShoppingCart}
                title="Your shopping bill is empty"
                description="Add an extra item here or bring scaled ingredients over from Calculate."
              />
            </div>
          ) : (
            <div className="px-3 py-3 sm:px-5">
              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto_2.5rem] gap-2 border-b border-dashed border-border px-2 py-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <span>#</span>
                <span>Item</span>
                <span>Quantity</span>
                <span className="sr-only">Actions</span>
              </div>
              <div className="space-y-3 pt-3">
                {recipeGroups.map((group) => (
                  <section
                    key={group.heading}
                    aria-labelledby={`bill-group-${group.heading.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                    className="overflow-hidden rounded-2xl border border-border/80"
                  >
                    <div className="flex items-center justify-between gap-3 bg-primary/8 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <ChefHat className="size-4 shrink-0 text-primary" />
                        <h3
                          id={`bill-group-${group.heading.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                          className="truncate font-extrabold"
                        >
                          {group.heading === "Extra items" ? group.heading : `Recipe: ${group.heading}`}
                        </h3>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                        {group.items.length} item{group.items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul aria-label={`${group.heading} shopping items`}>
                      {group.items.map((item, index) => (
                        <li
                          key={item.id}
                          className={cn(
                            "grid grid-cols-[2.5rem_minmax(0,1fr)_auto_2.5rem] items-center gap-2 border-t border-dashed border-border/70 px-2 py-3",
                            item.checked && "bg-success/5 text-muted-foreground"
                          )}
                        >
                          <button
                            type="button"
                            className={cn(
                              "flex size-8 items-center justify-center rounded-full border transition-colors",
                              item.checked
                                ? "border-success bg-success text-white"
                                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                            )}
                            aria-pressed={item.checked}
                            aria-label={`Mark ${item.name} as ${item.checked ? "needed" : "picked"}`}
                            onClick={() => toggleShoppingItem(item.id)}
                          >
                            {item.checked ? <Check className="size-4" /> : <Circle className="size-4 opacity-40" />}
                          </button>
                          <div className="min-w-0">
                            <p className={cn("truncate font-semibold", item.checked && "line-through")}>
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.heading === "Extra items" ? "Extra bill item" : `Ingredient ${String(index + 1).padStart(2, "0")}`}
                            </p>
                          </div>
                          <span className={cn("max-w-28 text-right text-sm font-bold", item.checked && "line-through")}>
                            {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:text-destructive"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => removeShoppingItem(item.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border bg-surface/40 px-5 py-4 text-sm sm:px-7">
              <span className="font-semibold">Picked {bought} of {items.length} items</span>
              <span className="font-mono text-xs text-muted-foreground">THANK YOU · HAPPY COOKING</span>
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <form onSubmit={addExtraItem} className="card-premium space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              <h2 className="font-extrabold">Add extra item</h2>
            </div>
            <div className="space-y-2">
              <label htmlFor="extra-item-name" className="text-sm font-semibold">Item name</label>
              <Input
                id="extra-item-name"
                value={itemName}
                onChange={(event) => {
                  setItemName(event.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="e.g. Dish soap"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="extra-item-quantity" className="text-sm font-semibold">Quantity</label>
              <Input
                id="extra-item-quantity"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="e.g. 2 bottles"
                className="h-11"
              />
            </div>
            {formError && <p role="alert" className="text-sm font-medium text-destructive">{formError}</p>}
            <Button type="submit" className="h-11 w-full rounded-xl">
              <Plus className="size-4" />
              Add to bill
            </Button>
          </form>

          <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
            {items.length > 0 && (
              <Button
                type="button"
                className="w-full justify-start rounded-xl"
                disabled={downloadingPdf}
                onClick={downloadPdf}
              >
                <Download className="size-4" />
                {downloadingPdf ? "Creating PDF..." : "Download shopping PDF"}
              </Button>
            )}
            {pdfError && <p role="alert" className="px-2 text-sm font-medium text-destructive">{pdfError}</p>}
            <Button asChild variant="outline" className="w-full justify-start rounded-xl">
              <Link href="/calculate">
                <ShoppingCart className="size-4" />
                Add recipe ingredients
              </Link>
            </Button>
            {bought > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start rounded-xl"
                onClick={clearCheckedShoppingItems}
              >
                <ListChecks className="size-4" />
                Delete picked items
              </Button>
            )}
            {items.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start rounded-xl text-destructive"
                onClick={clearShoppingList}
              >
                <Trash2 className="size-4" />
                Delete entire bill
              </Button>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
