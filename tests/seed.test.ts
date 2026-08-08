import { describe, expect, it } from "vitest";

import {
  DEMO_CUSTOMER,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  validateSeedCatalog,
} from "@/lib/seed";

describe("seed catalog", () => {
  it("defines exactly 5 categories", () => {
    expect(SEED_CATEGORIES).toHaveLength(5);
  });

  it("defines exactly 15 published products", () => {
    expect(SEED_PRODUCTS).toHaveLength(15);
    expect(SEED_PRODUCTS.every((p) => p.isPublished)).toBe(true);
  });

  it("gives every category and product a unique slug", () => {
    const categorySlugs = SEED_CATEGORIES.map((c) => c.slug);
    expect(new Set(categorySlugs).size).toBe(categorySlugs.length);

    const productSlugs = SEED_PRODUCTS.map((p) => p.slug);
    expect(new Set(productSlugs).size).toBe(productSlugs.length);
  });

  it("prices are positive integer cents", () => {
    for (const product of SEED_PRODUCTS) {
      expect(Number.isInteger(product.price), product.slug).toBe(true);
      expect(product.price, product.slug).toBeGreaterThan(0);
    }
  });

  it("compare-at prices exceed the sale price when present", () => {
    for (const product of SEED_PRODUCTS) {
      if (product.compareAtPrice !== undefined) {
        expect(product.compareAtPrice, product.slug).toBeGreaterThan(product.price);
      }
    }
  });

  it("every product references an existing category", () => {
    const categorySlugs = new Set(SEED_CATEGORIES.map((c) => c.slug));
    for (const product of SEED_PRODUCTS) {
      expect(categorySlugs.has(product.categorySlug), product.slug).toBe(true);
    }
  });

  it("gives every product non-negative stock and at least one image", () => {
    for (const product of SEED_PRODUCTS) {
      expect(Number.isInteger(product.stock), product.slug).toBe(true);
      expect(product.stock, product.slug).toBeGreaterThanOrEqual(0);
      expect(product.images.length, product.slug).toBeGreaterThan(0);
    }
  });

  it("points every product image at an https URL", () => {
    for (const product of SEED_PRODUCTS) {
      for (const image of product.images) {
        expect(image.startsWith("https://"), `${product.slug}: ${image}`).toBe(true);
      }
    }
  });

  it("exposes a demo customer with a known credential", () => {
    expect(DEMO_CUSTOMER.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(DEMO_CUSTOMER.password.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_CUSTOMER.fullName.length).toBeGreaterThan(0);
  });
});

describe("validateSeedCatalog", () => {
  it("accepts the shipped catalog", () => {
    expect(() => validateSeedCatalog()).not.toThrow();
  });

  it("rejects a duplicate product slug", () => {
    const products = [...SEED_PRODUCTS];
    products[1] = { ...products[1], slug: products[0].slug };
    expect(() => validateSeedCatalog(SEED_CATEGORIES, products)).toThrow(/duplicate/);
  });

  it("rejects a product referencing an unknown category", () => {
    const products = SEED_PRODUCTS.map((p) =>
      p.slug === SEED_PRODUCTS[0].slug
        ? { ...p, categorySlug: "nope" }
        : p,
    );
    expect(() => validateSeedCatalog(SEED_CATEGORIES, products)).toThrow(/category/);
  });
});
