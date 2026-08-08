import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resolveNext,
  resetPasswordSchema,
} from "@/lib/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    expect(
      loginSchema.safeParse({ email: "avery@example.com", password: "hunter22" })
        .success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      loginSchema.safeParse({ email: "not-an-email", password: "hunter22" })
        .success,
    ).toBe(false);
  });

  it("rejects a missing password", () => {
    expect(
      loginSchema.safeParse({ email: "avery@example.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "avery@example.com",
    password: "hunter22",
    confirmPassword: "hunter22",
  };

  it("accepts matching passwords", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      registerSchema.safeParse({ ...valid, email: "nope" }).success,
    ).toBe(false);
  });

  it("rejects a short password", () => {
    expect(
      registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" })
        .success,
    ).toBe(false);
  });

  it("rejects mismatched confirm password", () => {
    expect(
      registerSchema.safeParse({ ...valid, confirmPassword: "different" }).success,
    ).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "avery@example.com" }).success).toBe(
      true,
    );
  });

  it("rejects an invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "hunter22",
        confirmPassword: "hunter22",
      }).success,
    ).toBe(true);
  });

  it("rejects a short password", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "short", confirmPassword: "short" })
        .success,
    ).toBe(false);
  });

  it("rejects mismatched confirm password", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "hunter22", confirmPassword: "nope" })
        .success,
    ).toBe(false);
  });
});

describe("resolveNext", () => {
  it("falls back when next is absent or empty", () => {
    expect(resolveNext(undefined)).toBe("/");
    expect(resolveNext("")).toBe("/");
    expect(resolveNext(null)).toBe("/");
  });

  it("honors an absolute fallback", () => {
    expect(resolveNext(undefined, "/account")).toBe("/account");
  });

  it("keeps a same-origin relative path", () => {
    expect(resolveNext("/checkout")).toBe("/checkout");
  });

  it("keeps a relative path with query and hash", () => {
    expect(resolveNext("/catalog?category=shoes#top")).toBe("/catalog?category=shoes#top");
  });

  it("keeps a root path", () => {
    expect(resolveNext("/")).toBe("/");
  });

  it("rejects an absolute URL", () => {
    expect(resolveNext("https://evil.example.com/phish")).toBe("/");
  });

  it("rejects a protocol-relative URL", () => {
    expect(resolveNext("//evil.example.com/phish")).toBe("/");
  });

  it("rejects a non-path scheme", () => {
    expect(resolveNext("javascript:alert(1)")).toBe("/");
  });

  it("rejects a bare relative string without a leading slash", () => {
    expect(resolveNext("checkout")).toBe("/");
  });

  it("trims surrounding whitespace before judging", () => {
    expect(resolveNext("  /checkout  ")).toBe("/checkout");
  });
});
