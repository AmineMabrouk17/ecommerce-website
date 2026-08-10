import { describe, expect, it } from "vitest";

import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  parseAdminProductsParams,
  parseProductToggle,
  productStatus,
  productStatusLabel,
} from "@/lib/products-admin";

describe("parseAdminProductsParams", () => {
  it("defaults to no filters and the first page", () => {
    expect(parseAdminProductsParams({})).toEqual({
      search: null,
      category: null,
      page: 1,
      pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
      offset: 0,
    });
  });

  it("reads a trimmed, whitespace-collapsed search", () => {
    expect(parseAdminProductsParams({ search: "  running   shoes  " }).search).toBe(
      "running shoes",
    );
    expect(parseAdminProductsParams({ search: "   " }).search).toBeNull();
  });

  it("reads the category slug", () => {
    expect(parseAdminProductsParams({ category: "shoes" }).category).toBe("shoes");
  });

  it("clamps page to a positive integer", () => {
    expect(parseAdminProductsParams({ page: "3" }).page).toBe(3);
    expect(parseAdminProductsParams({ page: "0" }).page).toBe(1);
    expect(parseAdminProductsParams({ page: "-2" }).page).toBe(1);
    expect(parseAdminProductsParams({ page: "nope" }).page).toBe(1);
    expect(parseAdminProductsParams({ page: "1.5" }).page).toBe(1);
  });

  it("clamps page size to a positive integer within bounds", () => {
    expect(parseAdminProductsParams({ page_size: "25" }).pageSize).toBe(25);
    expect(parseAdminProductsParams({ page_size: "0" }).pageSize).toBe(1);
    expect(parseAdminProductsParams({ page_size: "500" }).pageSize).toBe(100);
    expect(parseAdminProductsParams({ page_size: "nope" }).pageSize).toBe(
      ADMIN_PRODUCTS_PAGE_SIZE,
    );
  });

  it("derives the offset from page and page size", () => {
    expect(parseAdminProductsParams({ page: "4" }).offset).toBe(30);
    expect(
      parseAdminProductsParams({ page: "2", page_size: "50" }).offset,
    ).toBe(50);
  });
});

describe("product status", () => {
  it("labels published products as Published", () => {
    expect(productStatus(true)).toBe("published");
    expect(productStatusLabel(true)).toBe("Published");
  });

  it("labels unpublished products as Draft", () => {
    expect(productStatus(false)).toBe("draft");
    expect(productStatusLabel(false)).toBe("Draft");
  });
});

describe("parseProductToggle", () => {
  it("parses an is_published toggle", () => {
    expect(
      parseProductToggle({ productId: "p1", field: "is_published", value: true }),
    ).toEqual({ ok: true, update: { is_published: true } });
    expect(
      parseProductToggle({ productId: "p1", field: "is_published", value: false }),
    ).toEqual({ ok: true, update: { is_published: false } });
  });

  it("parses an is_featured toggle", () => {
    expect(
      parseProductToggle({ productId: "p1", field: "is_featured", value: true }),
    ).toEqual({ ok: true, update: { is_featured: true } });
  });

  it("rejects a missing product id", () => {
    const result = parseProductToggle({
      productId: " ",
      field: "is_published",
      value: true,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-boolean value", () => {
    const result = parseProductToggle({
      productId: "p1",
      field: "is_published",
      value: "true",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an unsupported field", () => {
    const result = parseProductToggle({
      productId: "p1",
      field: "is_on_sale",
      value: true,
    });
    expect(result.ok).toBe(false);
  });
});
