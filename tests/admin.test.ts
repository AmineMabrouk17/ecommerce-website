import { describe, expect, it } from "vitest";

import { activeAdminNavItem, adminNavItems } from "@/lib/admin";

describe("adminNavItems", () => {
  it("defines the dashboard, products, and orders sections", () => {
    expect(adminNavItems.map((item) => item.label)).toEqual([
      "Dashboard",
      "Products",
      "Orders",
    ]);
    expect(adminNavItems.map((item) => item.href)).toEqual([
      "/admin",
      "/admin/products",
      "/admin/orders",
    ]);
  });
});

describe("activeAdminNavItem", () => {
  it("highlights the dashboard on /admin", () => {
    expect(activeAdminNavItem("/admin")?.href).toBe("/admin");
  });

  it("returns null on non-admin paths", () => {
    expect(activeAdminNavItem("/")).toBeNull();
    expect(activeAdminNavItem("/catalog")).toBeNull();
    expect(activeAdminNavItem("/administrator")).toBeNull();
    expect(activeAdminNavItem("/adminstration")).toBeNull();
  });

  it("highlights products on /admin/products and nested product paths", () => {
    expect(activeAdminNavItem("/admin/products")?.href).toBe("/admin/products");
    expect(activeAdminNavItem("/admin/products/new")?.href).toBe(
      "/admin/products",
    );
  });

  it("highlights orders on /admin/orders and nested order paths", () => {
    expect(activeAdminNavItem("/admin/orders")?.href).toBe("/admin/orders");
    expect(activeAdminNavItem("/admin/orders/123")?.href).toBe("/admin/orders");
  });

  it("returns null for unknown admin paths", () => {
    expect(activeAdminNavItem("/admin/unknown")).toBeNull();
  });
});
