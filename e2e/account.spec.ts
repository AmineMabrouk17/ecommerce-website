import { expect, test } from "@playwright/test";

import { CUSTOMER } from "./helpers/accounts";
import { signIn } from "./helpers/auth";

test.describe("signed-in customer account page", () => {
  test("profile name update saves and persists after reload", async ({
    page,
  }) => {
    await signIn(page, CUSTOMER);
    await page.goto("/account");

    await expect(page.getByText("Signed in as")).toBeVisible();

    const fullName = page.getByLabel("Name");
    const updatedName = `E2E Customer ${Date.now()}`;
    await fullName.fill(updatedName);
    await page.getByRole("button", { name: "Save profile" }).click();

    await expect(page.getByRole("status")).toHaveText("Profile saved.");

    await page.reload();
    await expect(page.getByLabel("Name")).toHaveValue(updatedName);
  });

  test("order history section renders", async ({ page }) => {
    await signIn(page, CUSTOMER);
    await page.goto("/account");

    await expect(page.getByText("Order history")).toBeVisible();

    const emptyState = page.getByText("No orders yet");
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(page.getByRole("listitem").first()).toBeVisible();
    }
  });
});
