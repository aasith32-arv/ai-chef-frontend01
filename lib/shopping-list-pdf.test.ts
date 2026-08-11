import { describe, expect, it } from "vitest";
import { groupShoppingItems } from "@/lib/shopping-list-pdf";
import type { ShoppingListItem } from "@/lib/shopping-list";

const item = (id: string, name: string, dish?: string): ShoppingListItem => ({
  id,
  name,
  quantity: "1",
  dish,
  checked: false,
  addedAt: Number(id),
});

describe("shopping list PDF grouping", () => {
  it("groups recipe ingredients and manual extras under document headings", () => {
    const groups = groupShoppingItems([
      item("3", "Rice", "Biryani"),
      item("2", "Chicken", "Biryani"),
      item("1", "Dish soap"),
    ]);

    expect(groups.map((group) => [group.heading, group.items.length])).toEqual([
      ["Biryani", 2],
      ["Extra items", 1],
    ]);
  });
});
