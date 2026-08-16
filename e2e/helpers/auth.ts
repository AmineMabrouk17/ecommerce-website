import { expect, type Page } from "@playwright/test";

import type { E2EAccount } from "./accounts";

export async function signIn(
  page: Page,
  account: E2EAccount,
  { next }: { next?: string } = {},
): Promise<void> {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function expectSignedIn(
  page: Page,
  account: E2EAccount,
): Promise<void> {
  await page.goto("/account");
  await expect(page.getByText("Signed in as")).toBeVisible();
  await expect(
    page.getByText(account.email, { exact: true }).first(),
  ).toBeVisible();
}

export async function openFirstInStockProduct(page: Page): Promise<string> {
  await page.goto("/catalog");
  const links = page.locator('main a[aria-label][href^="/product/"]');
  await links.first().waitFor();
  const count = await links.count();

  for (let index = 0; index < count; index++) {
    const link = links.nth(index);
    const productName = (await link.getAttribute("aria-label")) ?? "";
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForURL(/\/product\//);

    const addButton = page.getByRole("button", { name: "Add to cart" });
    await addButton.waitFor();
    if (await addButton.isEnabled()) {
      return productName;
    }
    await page.goBack();
    await page.waitForURL(/\/catalog/);
  }

  throw new Error("No in-stock product found");
}

export async function addFirstProductToCart(page: Page): Promise<string> {
  const productName = await openFirstInStockProduct(page);
  await page.getByRole("button", { name: "Add to cart" }).click();
  return productName;
}
