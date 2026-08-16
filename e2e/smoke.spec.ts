import { expect, test } from "@playwright/test";

test("home page loads and shows the shop header", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toBeVisible();
  await expect(header.getByRole("link", { name: /Lumina/ })).toBeVisible();
});
