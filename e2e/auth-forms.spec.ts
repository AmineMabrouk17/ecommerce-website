import { expect, test } from "@playwright/test";

test.describe("login form", () => {
  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("rejects a malformed email", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("supersecret1");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email")).toBeVisible();
  });

  test("rejects a missing password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("you@example.com");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("shows a server error for unknown credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("no-such-user@example.com");
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("links to register and forgot-password", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("link", { name: "Create an account" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Forgot your password?" }),
    ).toBeVisible();
  });
});

test.describe("register form", () => {
  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Invalid email")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("rejects a short password", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Email").fill("you@example.com");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByLabel("Confirm password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("rejects mismatched passwords", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Email").fill("you@example.com");
    await page.getByLabel("Password", { exact: true }).fill("supersecret1");
    await page
      .getByLabel("Confirm password", { exact: true })
      .fill("supersecret2");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});

test.describe("forgot password form", () => {
  test("rejects a malformed email", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByText("Invalid email")).toBeVisible();
  });

  test("confirms a reset link was sent", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByLabel("Email").fill("no-such-user@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(
      page.getByText("If that email has an account, a password reset link is on its way."),
    ).toBeVisible();
  });
});

test.describe("reset password form", () => {
  test("rejects a short password", async ({ page }) => {
    await page.goto("/reset-password");

    await page.getByLabel("New password", { exact: true }).fill("short");
    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill("short");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("rejects mismatched passwords", async ({ page }) => {
    await page.goto("/reset-password");

    await page.getByLabel("New password", { exact: true }).fill("supersecret1");
    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill("supersecret2");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});
