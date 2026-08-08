import { expect, test } from "@playwright/test";

test.describe("AI Cooking Intelligence", () => {
  test("opens Cooking Mode and advances only when the cook confirms", async ({ page }) => {
    await page.goto("/recipe/1");

    await expect(
      page.getByRole("heading", { name: "AI Cooking Intelligence" })
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Start Cooking Mode" }).click();
    await expect(page.getByText(/STEP 1 \/ 7/)).toBeVisible();
    await expect(page.getByText(/0% complete/)).toBeVisible();

    await page.getByRole("button", { name: "Start timer" }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.getByRole("button", { name: /Done · Next/ }).click();

    await expect(page.getByText(/STEP 2 \/ 7/)).toBeVisible();
    await expect(page.getByText(/14% complete/)).toBeVisible();
  });
});
