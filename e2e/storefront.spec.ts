import { expect, test, type Page } from "@playwright/test";

import { addFirstProductToCart, openFirstInStockProduct } from "./helpers/auth";

async function readProductCount(page: Page): Promise<number> {
  const label = await page.getByText(/^\d+ products?$/).innerText();
  return Number.parseInt(label.split(" ")[0], 10);
}

test.describe("home page", () => {
  test("renders shop navigation, the cart button, and product cards", async ({
    page,
  }) => {
    await page.goto("/");
    const banner = page.getByRole("banner");
    await expect(
      banner.getByRole("link", { name: "Shop", exact: true }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "Open cart", exact: true }),
    ).toBeVisible();

    const productCard = page.locator('main a[aria-label][href^="/product/"]');
    await expect(productCard.first()).toBeVisible();
    const href = await productCard.first().getAttribute("href");
    expect(href).toMatch(/^\/product\//);

    await banner.getByRole("link", { name: "Shop", exact: true }).click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(
      page.getByRole("heading", { name: "Shop all", exact: true }),
    ).toBeVisible();
  });
});

test.describe("catalog", () => {
  test("search narrows the results and the heading reflects the query", async ({
    page,
  }) => {
    await page.goto("/catalog");
    const total = await readProductCount(page);

    const firstProductLink = page
      .locator('main a[aria-label][href^="/product/"]')
      .first();
    await firstProductLink.waitFor();
    const query = (await firstProductLink.getAttribute("aria-label")) ?? "";

    await page.getByLabel("Search products").fill(query);
    await expect(page).toHaveURL(/\/catalog\?search=/);
    await expect(
      page.getByRole("heading", { name: `Search results for "${query}"` }),
    ).toBeVisible();

    const narrowed = await readProductCount(page);
    expect(narrowed).toBeGreaterThanOrEqual(1);
    expect(narrowed).toBeLessThan(total);
  });

  test("a gibberish query hits the empty state", async ({ page }) => {
    await page.goto("/catalog");
    const query = `zzqq${Math.random().toString(36).slice(2, 12)}`;

    await page.getByLabel("Search products").fill(query);
    await expect(page).toHaveURL(/\/catalog\?search=/);
    await expect(
      page.getByRole("heading", { name: `Search results for "${query}"` }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No products found", exact: true }),
    ).toBeVisible();
  });

  test("category filter and sort update the URL and Clear filters resets it", async ({
    page,
  }) => {
    await page.goto("/catalog");

    const category = page.getByLabel("Category");
    await category.selectOption({ index: 1 });
    const slug = await category.inputValue();
    await expect(page).toHaveURL(new RegExp(`category=${slug}`));
    await expect(
      page.getByRole("heading", { name: "Shop all", exact: true }),
    ).toBeVisible();

    await page.getByLabel("Sort").selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL("/catalog");
    await expect(
      page.getByRole("heading", { name: "Shop all", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Sort")).toHaveValue("newest");
    await expect(page.getByLabel("Category")).toHaveValue("");
  });
});

test.describe("product detail", () => {
  test("renders heading, price, stock, and the quantity stepper", async ({
    page,
  }) => {
    const productName = await openFirstInStockProduct(page);

    await expect(
      page.getByRole("heading", { name: productName, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/^\$\d[\d,]*\.\d{2}$/).first()).toBeVisible();
    await expect(
      page.getByText(/^(In stock|Only \d+ left in stock)$/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Decrease quantity" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Increase quantity" }),
    ).toBeVisible();
  });

  test("adding to cart updates the header badge", async ({ page }) => {
    await openFirstInStockProduct(page);

    await page.getByRole("button", { name: "Add to cart" }).click();
    const cartButton = page
      .getByRole("banner")
      .getByRole("button", { name: "Open cart", exact: true });
    await expect(cartButton).toContainText("1");
  });
});

test.describe("cart", () => {
  test("the drawer opened from the header shows the added line", async ({
    page,
  }) => {
    const productName = await addFirstProductToCart(page);

    await page
      .getByRole("button", { name: "Open cart", exact: true })
      .click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByRole("heading", { name: "Cart (1)", exact: true }),
    ).toBeVisible();
    await expect(drawer.getByText(productName, { exact: true })).toBeVisible();
  });

  test("the cart page shows the subtotal and a Checkout link", async ({
    page,
  }) => {
    const productName = await addFirstProductToCart(page);

    await page
      .getByRole("button", { name: "Open cart", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "View cart", exact: true })
      .click();

    await expect(page).toHaveURL(/\/cart$/);
    const main = page.getByRole("main");
    await expect(
      main.getByRole("heading", { name: "Your cart", exact: true }),
    ).toBeVisible();
    await expect(main.getByText(productName, { exact: true })).toBeVisible();
    await expect(main.getByText("Subtotal", { exact: true })).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Checkout", exact: true }),
    ).toBeVisible();
  });
});

test.describe("route guards", () => {
  for (const path of ["/checkout", "/account", "/admin"]) {
    test(`a logged-out visitor to ${path} is redirected to /login with next`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForURL(/\/login\?next=/);

      const url = new URL(page.url());
      expect(url.pathname).toBe("/login");
      expect(url.searchParams.get("next")).toBe(path);
      await expect(page.getByText("Welcome back", { exact: true })).toBeVisible();
    });
  }
});
