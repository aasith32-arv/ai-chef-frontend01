import { expect, test } from "@playwright/test";

/**
 * Requires the Flask API on localhost:5000 (seeded recipes).
 * Frontend is started by Playwright webServer.
 */
test.describe("Calculate → shopping list", () => {
  test("scales a dish and adds ingredients to the shopping list", async ({
    page,
  }) => {
    await page.goto("/calculate?dish=Hyderabadi%20Chicken%20Biryani");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await expect(page.getByRole("combobox", { name: /search recipes/i })).toHaveValue(
      /Hyderabadi Chicken Biryani/i,
      { timeout: 25_000 }
    );

    await page
      .getByRole("button", { name: /calculate ingredients/i })
      .click();

    await expect(
      page.getByRole("heading", { name: /Hyderabadi Chicken Biryani/i })
    ).toBeVisible({ timeout: 25_000 });

    await page.getByRole("button", { name: /add ingredients to shopping list/i }).click();

    await page.goto("/shopping-list");
    await expect(
      page.getByRole("heading", { name: /shopping list/i })
    ).toBeVisible();

    const items = page.locator("ul li");
    await expect(items.first()).toBeVisible();
    await expect(page.getByText(/your list is empty/i)).toHaveCount(0);
  });
});
