import { describe, expect, it } from "vitest";

import { buildPagination, parseCatalogParams } from "@/lib/catalog";

describe("parseCatalogParams", () => {
  it("returns defaults for empty params", () => {
    expect(parseCatalogParams({})).toEqual({
      search: null,
      filters: {
        category: null,
        minPriceCents: null,
        maxPriceCents: null,
        inStock: false,
      },
      sort: "newest",
      page: 1,
      pageSize: 24,
      offset: 0,
    });
  });

  it("parses the category slug", () => {
    const spec = parseCatalogParams({ category: "apparel" });
    expect(spec.filters.category).toBe("apparel");
  });

  it("treats an empty category as unset", () => {
    expect(parseCatalogParams({ category: "   " }).filters.category).toBeNull();
  });

  it("normalizes search text and selects relevance ranking by default", () => {
    const spec = parseCatalogParams({ search: "  wireless   headphones  " });
    expect(spec.search).toBe("wireless headphones");
    expect(spec.sort).toBe("relevance");
  });

  it("keeps an explicit sort when a search is present", () => {
    const spec = parseCatalogParams({ search: "shoes", sort: "price_asc" });
    expect(spec.sort).toBe("price_asc");
  });

  it("maps price ranges in dollars to integer cents", () => {
    const spec = parseCatalogParams({ min_price: "25", max_price: "49.99" });
    expect(spec.filters.minPriceCents).toBe(2500);
    expect(spec.filters.maxPriceCents).toBe(4999);
  });

  it("drops invalid or negative price bounds", () => {
    const spec = parseCatalogParams({ min_price: "abc", max_price: "-5" });
    expect(spec.filters.minPriceCents).toBeNull();
    expect(spec.filters.maxPriceCents).toBeNull();
  });

  it("parses the in_stock availability filter", () => {
    expect(parseCatalogParams({ in_stock: "true" }).filters.inStock).toBe(true);
    expect(parseCatalogParams({ in_stock: "1" }).filters.inStock).toBe(true);
    expect(parseCatalogParams({ in_stock: "false" }).filters.inStock).toBe(false);
  });

  it("parses the supported sorts and falls back to newest", () => {
    expect(parseCatalogParams({ sort: "price_asc" }).sort).toBe("price_asc");
    expect(parseCatalogParams({ sort: "price_desc" }).sort).toBe("price_desc");
    expect(parseCatalogParams({ sort: "newest" }).sort).toBe("newest");
    expect(parseCatalogParams({ sort: "trending" }).sort).toBe("trending");
    expect(parseCatalogParams({ sort: "bogus" }).sort).toBe("newest");
  });

  it("parses pagination with defaults, clamps page size, and computes offset", () => {
    const spec = parseCatalogParams({ page: "3", page_size: "12" });
    expect(spec.page).toBe(3);
    expect(spec.pageSize).toBe(12);
    expect(spec.offset).toBe(24);

    const clamped = parseCatalogParams({ page: "0", page_size: "1000" });
    expect(clamped.page).toBe(1);
    expect(clamped.pageSize).toBe(100);
  });

  it("combines category, price, and availability filters together", () => {
    const spec = parseCatalogParams({
      category: "apparel",
      min_price: "10",
      max_price: "50",
      in_stock: "true",
    });
    expect(spec.filters).toEqual({
      category: "apparel",
      minPriceCents: 1000,
      maxPriceCents: 5000,
      inStock: true,
    });
  });
});

describe("buildPagination", () => {
  it("includes page size, total count, total pages, and offset", () => {
    expect(buildPagination({ totalCount: 250, pageSize: 24, page: 3 })).toEqual({
      page: 3,
      pageSize: 24,
      totalCount: 250,
      totalPages: 11,
      offset: 48,
    });
  });

  it("yields one page for an empty result", () => {
    expect(buildPagination({ totalCount: 0, pageSize: 24, page: 1 })).toEqual({
      page: 1,
      pageSize: 24,
      totalCount: 0,
      totalPages: 0,
      offset: 0,
    });
  });

  it("clamps the page to the last page when it exceeds total pages", () => {
    const pagination = buildPagination({ totalCount: 10, pageSize: 24, page: 5 });
    expect(pagination.page).toBe(1);
    expect(pagination.totalPages).toBe(1);
  });

  it("clamps the page size to the allowed maximum", () => {
    const pagination = buildPagination({ totalCount: 500, pageSize: 1000, page: 2 });
    expect(pagination.pageSize).toBe(100);
    expect(pagination.totalPages).toBe(5);
  });
});
