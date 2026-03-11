import { test, expect } from "@playwright/test";

test("index loads and renders a canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 10000 });
});
