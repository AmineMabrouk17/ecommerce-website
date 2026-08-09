import { describe, expect, it } from "vitest";

import {
  buildPageNumbers,
  buildPagination,
  buildTrending,
  parseCatalogParams,
  rankTrending,
  serializeCatalogParams,
  updateCatalogParams,
} from "@/lib/catalog";

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

describe("rankTrending", () => {
  const base = (overrides: Record<string, unknown>) => ({
    id: "p1",
    unitsOrdered30d: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  });

  it("ranks by units ordered in the last 30 days", () => {
    const products = [
      base({ id: "a", unitsOrdered30d: 3 }),
      base({ id: "b", unitsOrdered30d: 10 }),
      base({ id: "c", unitsOrdered30d: 1 }),
    ];
    expect(rankTrending(products).map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("falls back to newest arrival when sales are tied", () => {
    const products = [
      base({ id: "old", unitsOrdered30d: 5, createdAt: "2026-01-01T00:00:00.000Z" }),
      base({ id: "new", unitsOrdered30d: 5, createdAt: "2026-06-01T00:00:00.000Z" }),
    ];
    expect(rankTrending(products).map((p) => p.id)).toEqual(["new", "old"]);
  });

  it("falls back to newest arrival when there is no sales data", () => {
    const products = [
      base({ id: "a", unitsOrdered30d: 0, createdAt: "2026-01-01T00:00:00.000Z" }),
      base({ id: "b", unitsOrdered30d: 0, createdAt: "2026-05-01T00:00:00.000Z" }),
    ];
    expect(rankTrending(products).map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("does not mutate the input array", () => {
    const products = [
      base({ id: "a", unitsOrdered30d: 1 }),
      base({ id: "b", unitsOrdered30d: 2 }),
    ];
    const before = products.map((p) => p.id);
    rankTrending(products);
    expect(products.map((p) => p.id)).toEqual(before);
  });
});

describe("buildTrending", () => {
  const product = (id: string, createdAt: string) => ({
    id,
    createdAt,
    name: `Product ${id}`,
  });

  it("merges units ordered in the last 30 days and ranks by sales", () => {
    const products = [
      product("a", "2026-01-01T00:00:00.000Z"),
      product("b", "2026-02-01T00:00:00.000Z"),
      product("c", "2026-03-01T00:00:00.000Z"),
    ];
    const sales = new Map([
      ["c", 7],
      ["a", 2],
    ]);
    const ranked = buildTrending(products, sales);
    expect(ranked.map((p) => p.id)).toEqual(["c", "a", "b"]);
    expect(ranked[0].unitsOrdered30d).toBe(7);
    expect(ranked[1].unitsOrdered30d).toBe(2);
    expect(ranked[2].unitsOrdered30d).toBe(0);
  });

  it("ranks products without sales by newest arrival", () => {
    const products = [
      product("old", "2026-01-01T00:00:00.000Z"),
      product("new", "2026-06-01T00:00:00.000Z"),
    ];
    expect(buildTrending(products, new Map()).map((p) => p.id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("breaks sales ties by newest arrival", () => {
    const products = [
      product("old", "2026-01-01T00:00:00.000Z"),
      product("new", "2026-06-01T00:00:00.000Z"),
    ];
    const sales = new Map([
      ["old", 4],
      ["new", 4],
    ]);
    expect(buildTrending(products, sales).map((p) => p.id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("defaults to newest ordering when no sales map is given", () => {
    const products = [
      product("old", "2026-01-01T00:00:00.000Z"),
      product("new", "2026-06-01T00:00:00.000Z"),
    ];
    expect(buildTrending(products).map((p) => p.id)).toEqual(["new", "old"]);
  });

  it("does not mutate the input array", () => {
    const products = [
      product("a", "2026-01-01T00:00:00.000Z"),
      product("b", "2026-02-01T00:00:00.000Z"),
    ];
    const before = products.map((p) => p.id);
    buildTrending(products, new Map([["a", 9]]));
    expect(products.map((p) => p.id)).toEqual(before);
  });
});

describe("updateCatalogParams", () => {
  it("sets a param while preserving the others", () => {
    const next = updateCatalogParams(
      new URLSearchParams({ category: "apparel", sort: "price_asc" }),
      { search: "shoes" },
    );
    expect(next.toString()).toBe("category=apparel&sort=price_asc&search=shoes");
  });

  it("removes a param when the patch value is empty", () => {
    const next = updateCatalogParams(new URLSearchParams({ search: "shoes" }), {
      search: "",
    });
    expect(next.toString()).toBe("");
  });

  it("removes a param when the patch value is null", () => {
    const next = updateCatalogParams(
      new URLSearchParams({ category: "apparel", in_stock: "true" }),
      { category: null },
    );
    expect(next.toString()).toBe("in_stock=true");
  });

  it("drops the page param when a non-page param changes", () => {
    const next = updateCatalogParams(
      new URLSearchParams({ category: "apparel", page: "3" }),
      { sort: "price_desc" },
    );
    expect(next.toString()).toBe("category=apparel&sort=price_desc");
  });

  it("keeps the other params when only the page changes", () => {
    const next = updateCatalogParams(
      new URLSearchParams({ category: "apparel", page: "2" }),
      { page: "3" },
    );
    expect(next.toString()).toBe("category=apparel&page=3");
  });

  it("sets the page when no page param exists yet", () => {
    const next = updateCatalogParams(new URLSearchParams(), { page: "2" });
    expect(next.toString()).toBe("page=2");
  });

  it("ignores patch entries whose value is undefined", () => {
    const next = updateCatalogParams(new URLSearchParams({ category: "tech" }), {
      search: undefined,
    });
    expect(next.toString()).toBe("category=tech");
  });

  it("does not mutate the input search params", () => {
    const current = new URLSearchParams({ category: "apparel" });
    updateCatalogParams(current, { search: "shoes" });
    expect(current.toString()).toBe("category=apparel");
  });
});

describe("serializeCatalogParams", () => {
  it("omits all defaults", () => {
    const spec = parseCatalogParams({});
    expect(serializeCatalogParams(spec).toString()).toBe("");
  });

  it("includes every non-default value in canonical form", () => {
    const spec = parseCatalogParams({
      search: "wireless headphones",
      category: "tech",
      min_price: "25",
      max_price: "49.99",
      in_stock: "true",
      sort: "price_asc",
      page: "3",
      page_size: "12",
    });
    expect(serializeCatalogParams(spec).toString()).toBe(
      "search=wireless+headphones&category=tech&min_price=25&max_price=49.99&in_stock=true&sort=price_asc&page=3&page_size=12",
    );
  });

  it("drops the default sort and page", () => {
    const spec = parseCatalogParams({ category: "apparel", page: "1" });
    expect(serializeCatalogParams(spec).toString()).toBe("category=apparel");
  });

  it("drops the derived relevance sort so the server re-derives it", () => {
    const spec = parseCatalogParams({ search: "shoes" });
    expect(spec.sort).toBe("relevance");
    expect(serializeCatalogParams(spec).toString()).toBe("search=shoes");
  });

  it("formats integer-cents prices without trailing zeros", () => {
    const spec = parseCatalogParams({ min_price: "25", max_price: "49.99" });
    expect(serializeCatalogParams(spec).toString()).toBe(
      "min_price=25&max_price=49.99",
    );
  });
});

describe("buildPageNumbers", () => {
  it("returns every page for a small page count", () => {
    expect(buildPageNumbers(2, 3)).toEqual([1, 2, 3]);
  });

  it("returns a single page for an empty result", () => {
    expect(buildPageNumbers(1, 1)).toEqual([1]);
  });

  it("windows around the current page with ellipses on both sides", () => {
    expect(buildPageNumbers(6, 12)).toEqual([1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 12]);
  });

  it("shows all pages when the window reaches the first page", () => {
    expect(buildPageNumbers(1, 8)).toEqual([1, 2, 3, "ellipsis", 8]);
  });

  it("shows all pages when the window reaches the last page", () => {
    expect(buildPageNumbers(8, 8)).toEqual([1, "ellipsis", 6, 7, 8]);
  });

  it("does not insert an ellipsis for a single-page gap", () => {
    expect(buildPageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("clamps an out-of-range current page to the bounds", () => {
    expect(buildPageNumbers(0, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageNumbers(99, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
