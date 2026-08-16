import { expect, test } from "@playwright/test";

import { CUSTOMER } from "./helpers/accounts";
import { expectSignedIn, signIn } from "./helpers/auth";

test("signs in with the E2E customer and lands on the home page", async ({
  page,
}) => {
  await signIn(page, CUSTOMER);

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("banner").getByRole("link", { name: /Lumina/ }),
  ).toBeVisible();
});

test("honors the ?next=/account redirect after login", async ({ page }) => {
  await signIn(page, CUSTOMER, { next: "/account" });

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
});

test("signed-in state is visible on the account page", async ({ page }) => {
  await signIn(page, CUSTOMER);

  await expectSignedIn(page, CUSTOMER);
});
