import { expect, test } from "@playwright/test";

test("signed-out visitors are redirected away from the Admin Console", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
