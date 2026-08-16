import { expect, test } from "@playwright/test";

import { ADMIN } from "./helpers/accounts";
import { signIn } from "./helpers/auth";

test("admin user reaches the admin console without being redirected", async ({
  page,
}) => {
  await signIn(page, ADMIN);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();

  const main = page.getByRole("main");
  for (const label of [
    "Total revenue",
    "30-day revenue",
    "Orders",
    "Average order value",
  ]) {
    await expect(main.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(main.getByText("Low stock", { exact: true })).toBeVisible();
  await expect(main.getByText("Revenue", { exact: true })).toBeVisible();

  for (const label of ["Dashboard", "Products", "Orders"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("products page renders its toolbar and table, and search narrows the list", async ({
  page,
}) => {
  await signIn(page, ADMIN);
  await page.goto("/admin/products");

  await expect(
    page.getByRole("heading", { level: 1, name: "Products" }),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search products" }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Filter by category" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
  await expect(page.getByText(/^\d+ products?$/)).toBeVisible();

  for (const header of [
    "Product",
    "Category",
    "Price",
    "Stock",
    "Status",
    "Published",
    "Featured",
    "Actions",
  ]) {
    await expect(page.getByRole("columnheader", { name: header })).toBeVisible();
  }

  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill(`zzzz-no-match-${Date.now()}`);
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByText("No products match your search.")).toBeVisible();
  await expect(page.getByText("0 products")).toBeVisible();
});

test("product dialog validates, creates an unpublished product, and the publish toggle flips its status", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page, ADMIN);
  await page.goto("/admin/products");

  const productName = `E2E Admin Product ${Date.now()}`;
  const productSlug = `e2e-admin-product-${Date.now()}`;

  await page.getByRole("button", { name: "New product" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "New product" }),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Create product" }).click();

  for (const message of [
    "Name is required",
    "Slug is required",
    "Category is required",
  ]) {
    await expect(dialog.getByText(message)).toBeVisible();
  }

  await dialog.getByLabel("Name").fill(productName);
  await dialog.getByLabel("Slug").fill(productSlug);
  await dialog.getByLabel("Description").fill("Created by the E2E admin spec.");
  await dialog.getByLabel("Category").selectOption({ label: "Apparel" });
  await dialog.getByLabel("Price", { exact: true }).fill("12.50");
  await dialog.getByLabel("Price", { exact: true }).blur();
  await dialog.getByLabel("Stock").fill("5");

  await dialog.getByRole("button", { name: "Create product" }).click();
  await expect(dialog).not.toBeVisible({ timeout: 15_000 });

  const row = page.getByRole("row", { name: new RegExp(productName) });
  await expect(row).toBeVisible();
  await expect(row.getByText("Draft")).toBeVisible();

  const publishedToggle = page.getByRole("switch", {
    name: `Toggle published status for ${productName}`,
  });
  await expect(publishedToggle).toBeVisible();

  await publishedToggle.click();
  await expect(row.getByText("Published")).toBeVisible({ timeout: 15_000 });

  await publishedToggle.click();
  await expect(row.getByText("Draft")).toBeVisible({ timeout: 15_000 });
});

test("orders list renders and the order detail opens when orders exist", async ({
  page,
}) => {
  await signIn(page, ADMIN);
  await page.goto("/admin/orders");

  await expect(
    page.getByRole("heading", { level: 1, name: "Orders" }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Filter by status" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
  await expect(page.getByText(/^\d+ orders?$/)).toBeVisible();

  const viewOrder = page.getByRole("link", { name: "View" }).first();
  if ((await viewOrder.count()) > 0) {
    await viewOrder.click();
    await expect(page.getByRole("heading", { name: /^Order / })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Items")).toBeVisible({ timeout: 15_000 });
  } else {
    await expect(page.getByText("No orders match your filter.")).toBeVisible();
  }
});
