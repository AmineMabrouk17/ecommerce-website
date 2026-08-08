import { describe, expect, it } from "vitest";

import { guardRoute } from "@/lib/route-guard";

const guest = { isAuthenticated: false, role: null };
const customer = { isAuthenticated: true, role: "customer" as const };
const admin = { isAuthenticated: true, role: "admin" as const };

describe("guardRoute", () => {
  it("lets guests through public routes", () => {
    expect(guardRoute({ pathname: "/", ...guest })).toBeNull();
    expect(guardRoute({ pathname: "/products/aurora-boots", ...guest })).toBeNull();
    expect(guardRoute({ pathname: "/login", ...guest })).toBeNull();
    expect(guardRoute({ pathname: "/catalog?category=shoes", ...guest })).toBeNull();
  });

  it("lets customers through public routes", () => {
    expect(guardRoute({ pathname: "/", ...customer })).toBeNull();
    expect(guardRoute({ pathname: "/products/aurora-boots", ...customer })).toBeNull();
  });

  it("lets admins through public routes", () => {
    expect(guardRoute({ pathname: "/", ...admin })).toBeNull();
    expect(guardRoute({ pathname: "/products/aurora-boots", ...admin })).toBeNull();
  });

  describe("customer routes (/checkout, /account)", () => {
    it("redirects a guest away from /checkout", () => {
      expect(guardRoute({ pathname: "/checkout", ...guest })).toEqual({
        redirectTo: "/login?next=%2Fcheckout",
        reason: "unauthenticated",
      });
    });

    it("redirects a guest away from a nested checkout path", () => {
      expect(guardRoute({ pathname: "/checkout/payment", ...guest })).toEqual({
        redirectTo: "/login?next=%2Fcheckout%2Fpayment",
        reason: "unauthenticated",
      });
    });

    it("redirects a guest away from /account", () => {
      expect(guardRoute({ pathname: "/account", ...guest })).toEqual({
        redirectTo: "/login?next=%2Faccount",
        reason: "unauthenticated",
      });
    });

    it("lets a customer through /checkout", () => {
      expect(guardRoute({ pathname: "/checkout", ...customer })).toBeNull();
    });

    it("lets a customer through /account", () => {
      expect(guardRoute({ pathname: "/account", ...customer })).toBeNull();
    });

    it("lets an admin through /account", () => {
      expect(guardRoute({ pathname: "/account", ...admin })).toBeNull();
    });
  });

  describe("admin routes (/admin)", () => {
    it("redirects a guest away from /admin", () => {
      expect(guardRoute({ pathname: "/admin", ...guest })).toEqual({
        redirectTo: "/login?next=%2Fadmin",
        reason: "unauthenticated",
      });
    });

    it("redirects a guest away from a nested admin path", () => {
      expect(guardRoute({ pathname: "/admin/products", ...guest })).toEqual({
        redirectTo: "/login?next=%2Fadmin%2Fproducts",
        reason: "unauthenticated",
      });
    });

    it("redirects a customer away from /admin", () => {
      expect(guardRoute({ pathname: "/admin", ...customer })).toEqual({
        redirectTo: "/",
        reason: "forbidden",
      });
    });

    it("redirects a customer away from a nested admin path", () => {
      expect(guardRoute({ pathname: "/admin/products", ...customer })).toEqual({
        redirectTo: "/",
        reason: "forbidden",
      });
    });

    it("lets an admin through /admin", () => {
      expect(guardRoute({ pathname: "/admin", ...admin })).toBeNull();
    });

    it("lets an admin through a nested admin path", () => {
      expect(guardRoute({ pathname: "/admin/orders/123", ...admin })).toBeNull();
    });

    it("does not treat similarly-prefixed public routes as admin routes", () => {
      expect(guardRoute({ pathname: "/administrator", ...customer })).toBeNull();
      expect(guardRoute({ pathname: "/adminstration", ...guest })).toBeNull();
    });
  });

  describe("customization", () => {
    it("uses a custom login path", () => {
      expect(
        guardRoute({
          pathname: "/checkout",
          isAuthenticated: false,
          role: null,
          loginPath: "/sign-in",
        }),
      ).toEqual({
        redirectTo: "/sign-in?next=%2Fcheckout",
        reason: "unauthenticated",
      });
    });

    it("uses a custom forbidden path", () => {
      expect(
        guardRoute({
          pathname: "/admin",
          isAuthenticated: true,
          role: "customer",
          forbiddenPath: "/account",
        }),
      ).toEqual({
        redirectTo: "/account",
        reason: "forbidden",
      });
    });

    it("URL-encodes the next path for the login redirect", () => {
      expect(guardRoute({ pathname: "/checkout/payment", ...guest })).toEqual({
        redirectTo: "/login?next=%2Fcheckout%2Fpayment",
        reason: "unauthenticated",
      });
    });
  });
});
