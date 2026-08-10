import { expect, test } from "@playwright/test";

test.describe("Smart recipe quantity calculator", () => {
  test("searches, scales, and continues to the existing recipe flow", async ({ page }) => {
    await page.goto("/calculate");

    await expect(page.getByRole("heading", { name: "Ingredient Calculator" })).toBeVisible();
    await expect(page.getByText(/API \+|Gemini ready|OpenAI ready/i)).toHaveCount(0);

    const search = page.getByRole("combobox", { name: "Search recipes…" });
    await search.fill("Hyderabadi Chicken Biryani");
    await page.getByRole("option", { name: /Hyderabadi Chicken Biryani/i }).click();
    await page.getByRole("button", { name: "50" }).click();
    await page.getByRole("button", { name: "Calculate Ingredients" }).click();

    await expect(page.getByText("Ingredients for 50 people")).toBeVisible();
    await page.getByLabel("Missing ingredient").selectOption({ label: "Basmati rice" });
    await page
      .getByRole("button", { name: "Find substitution for selected ingredient" })
      .click();
    await expect(page.getByText("sella basmati rice").first()).toBeVisible();
    await page.getByRole("button", { name: "Use Substitute" }).first().click();
    await expect(page.getByText(/Substituted for Basmati rice/).last()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Ingredients to Shopping List" })).toBeVisible();
    await page.getByRole("button", { name: "Add Ingredients to Shopping List" }).click();
    const shoppingItems = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ai-chef:shopping-list") || "[]")
    );
    expect(shoppingItems.some((item: { name: string }) => item.name === "sella basmati rice")).toBe(true);
    await page.getByRole("button", { name: "Undo" }).last().click();
    await expect(page.getByText(/Substituted for Basmati rice/)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "View Full Recipe" })).toHaveAttribute("href", /\/recipe\/\d+$/);
    await expect(page.getByRole("link", { name: "Start Cooking" })).toHaveAttribute(
      "href",
      /\/recipe\/\d+\?servings=50#guided-cooking$/
    );
  });

  test("stays within the mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/calculate");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});
