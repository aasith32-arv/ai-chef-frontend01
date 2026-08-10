import { expect, test } from "@playwright/test";

test.describe("Food family discovery", () => {
  test("opens a category, family, variety, and existing recipe detail", async ({ page }) => {
    await page.goto("/families?category=Rice%20Dishes");
    await expect(page.getByRole("heading", { name: "Rice Dishes" })).toBeVisible();
    await page.getByRole("link", { name: /Biryani/ }).first().click();
    await expect(page.getByRole("heading", { name: /Biryani Varieties/ })).toBeVisible();
    await page.getByRole("link", { name: /Hyderabadi Chicken Biryani/ }).click();
    await expect(page).toHaveURL(/\/recipe\/\d+/);
    await expect(page.getByRole("heading", { name: "Hyderabadi Chicken Biryani" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Cooking Intelligence" })).toBeVisible();
  });

  test("search finds a family and regional varieties", async ({ page }) => {
    await page.goto("/families?search=Jaffna");
    await expect(page.getByRole("heading", { name: /Jaffna/ })).toBeVisible();
    await expect(page.getByText("Jaffna-style Chicken Curry")).toBeVisible();
  });

  test("variety grid is a single column on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/families/biryani");
    const cards = page.getByTestId("variety-grid").locator("a");
    await expect(cards.nth(1)).toBeVisible();
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeLessThan(2);
    expect((second?.y ?? 0)).toBeGreaterThan(first?.y ?? 0);
  });
});
