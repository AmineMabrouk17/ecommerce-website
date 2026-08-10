import { describe, expect, it } from "vitest";

import {
  addProductImage,
  buildProductImagePath,
  centsToDollars,
  dollarsToCents,
  isAcceptedProductImage,
  MAX_PRODUCT_IMAGES,
  moveProductImage,
  productFormSchema,
  removeProductImageAt,
  slugifyProductName,
} from "@/lib/products-form";

const VALID_PRODUCT = {
  name: "Lumina Everyday Tee",
  slug: "lumina-everyday-tee",
  description: "A soft organic-cotton tee.",
  categoryId: "cat-1",
  priceCents: 2499,
  compareAtPriceCents: 3200,
  stock: 12,
  images: ["https://example.com/tee.jpg"],
  isFeatured: false,
  isPublished: true,
};

describe("slugifyProductName", () => {
  it("lowercases and hyphenates a title", () => {
    expect(slugifyProductName("Lumina Everyday Tee")).toBe("lumina-everyday-tee");
  });

  it("collapses whitespace and punctuation", () => {
    expect(slugifyProductName("Cloudknit  Hoodie")).toBe("cloudknit-hoodie");
    expect(slugifyProductName("Heritage Denim — Jacket")).toBe(
      "heritage-denim-jacket",
    );
    expect(slugifyProductName("Sneaker's Deluxe!!")).toBe("sneaker-s-deluxe");
  });

  it("strips accents", () => {
    expect(slugifyProductName("Café au Lait Mug")).toBe("cafe-au-lait-mug");
  });

  it("trims leading and trailing separators", () => {
    expect(slugifyProductName("  Cozy Blanket  ")).toBe("cozy-blanket");
  });

  it("leaves an already-valid slug unchanged", () => {
    expect(slugifyProductName("swift-runners")).toBe("swift-runners");
  });

  it("returns an empty string for a non-alphanumeric title", () => {
    expect(slugifyProductName("  —!!  ")).toBe("");
  });
});

describe("dollarsToCents", () => {
  it("converts dollar strings to integer cents", () => {
    expect(dollarsToCents("12.50")).toBe(1250);
    expect(dollarsToCents("$49.99")).toBe(4999);
    expect(dollarsToCents("10")).toBe(1000);
    expect(dollarsToCents("12.5")).toBe(1250);
    expect(dollarsToCents("0")).toBe(0);
    expect(dollarsToCents("0.05")).toBe(5);
  });

  it("accepts thousands separators", () => {
    expect(dollarsToCents("$1,234.50")).toBe(123450);
  });

  it("rejects malformed or non-positive input", () => {
    expect(dollarsToCents("abc")).toBeNull();
    expect(dollarsToCents("12.345")).toBeNull();
    expect(dollarsToCents("-5")).toBeNull();
    expect(dollarsToCents("")).toBeNull();
    expect(dollarsToCents(" ")).toBeNull();
  });
});

describe("centsToDollars", () => {
  it("formats integer cents as a two-decimal dollar string", () => {
    expect(centsToDollars(1250)).toBe("12.50");
    expect(centsToDollars(0)).toBe("0.00");
    expect(centsToDollars(5)).toBe("0.05");
    expect(centsToDollars(123450)).toBe("1234.50");
  });

  it("rejects non-integer and negative amounts", () => {
    expect(() => centsToDollars(12.5)).toThrow(RangeError);
    expect(() => centsToDollars(-5)).toThrow(RangeError);
  });
});

describe("productFormSchema", () => {
  it("accepts a valid create payload", () => {
    expect(productFormSchema.safeParse(VALID_PRODUCT).success).toBe(true);
  });

  it("accepts a valid edit payload with a product id", () => {
    const result = productFormSchema.safeParse({ ...VALID_PRODUCT, productId: "p1" });
    expect(result.success).toBe(true);
  });

  it("accepts missing optional description and compare-at price", () => {
    const { description: _description, compareAtPriceCents: _compareAt, ...rest } =
      VALID_PRODUCT;
    expect(productFormSchema.safeParse(rest).success).toBe(true);
  });

  it("requires a non-blank name", () => {
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, name: " " }).success).toBe(
      false,
    );
  });

  it("rejects a malformed slug", () => {
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, slug: "Bad Slug" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, slug: "-leading" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, slug: "UPPERCASE" }).success).toBe(false);
  });

  it("requires a category", () => {
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, categoryId: " " }).success).toBe(
      false,
    );
  });

  it("requires a whole, non-negative price in cents", () => {
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, priceCents: -1 }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, priceCents: 12.5 }).success).toBe(false);
  });

  it("requires compare-at price to exceed the price", () => {
    expect(
      productFormSchema.safeParse({
        ...VALID_PRODUCT,
        compareAtPriceCents: 2499,
      }).success,
    ).toBe(false);
    expect(
      productFormSchema.safeParse({
        ...VALID_PRODUCT,
        compareAtPriceCents: 1000,
      }).success,
    ).toBe(false);
  });

  it("requires a whole, non-negative stock count", () => {
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, stock: -1 }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, stock: 2.5 }).success).toBe(false);
  });

  it("caps the number of images", () => {
    const images = Array.from(
      { length: MAX_PRODUCT_IMAGES + 1 },
      (_, index) => `https://example.com/${index}.jpg`,
    );
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, images }).success).toBe(
      false,
    );
  });

  it("requires image values to be valid URLs", () => {
    expect(productFormSchema.safeParse({ ...VALID_PRODUCT, images: ["not-a-url"] }).success).toBe(
      false,
    );
  });
});

describe("product image operations", () => {
  const base = ["a.jpg", "b.jpg", "c.jpg"];

  it("appends an image to a new array", () => {
    const next = addProductImage(base, "d.jpg");
    expect(next).toEqual(["a.jpg", "b.jpg", "c.jpg", "d.jpg"]);
    expect(base).toEqual(["a.jpg", "b.jpg", "c.jpg"]);
  });

  it("never exceeds the maximum image count", () => {
    const full = Array.from(
      { length: MAX_PRODUCT_IMAGES },
      (_, index) => `${index}.jpg`,
    );
    expect(addProductImage(full, "x.jpg")).toHaveLength(MAX_PRODUCT_IMAGES);
  });

  it("removes the image at an index", () => {
    expect(removeProductImageAt(base, 1)).toEqual(["a.jpg", "c.jpg"]);
    expect(removeProductImageAt(base, 0)).toEqual(["b.jpg", "c.jpg"]);
  });

  it("ignores out-of-range removals", () => {
    expect(removeProductImageAt(base, -1)).toEqual(base);
    expect(removeProductImageAt(base, 3)).toEqual(base);
  });

  it("moves an image up and down", () => {
    expect(moveProductImage(base, 2, 0)).toEqual(["c.jpg", "a.jpg", "b.jpg"]);
    expect(moveProductImage(base, 0, 2)).toEqual(["b.jpg", "c.jpg", "a.jpg"]);
  });

  it("clamps out-of-range moves", () => {
    expect(moveProductImage(base, 2, 99)).toEqual(["a.jpg", "b.jpg", "c.jpg"]);
    expect(moveProductImage(base, 0, -5)).toEqual(["a.jpg", "b.jpg", "c.jpg"]);
  });
});

describe("isAcceptedProductImage", () => {
  it("accepts image files within the size limit", () => {
    expect(
      isAcceptedProductImage({ name: "a.png", type: "image/png", size: 1024 }),
    ).toBe(true);
    expect(
      isAcceptedProductImage({
        name: "a.jpg",
        type: "image/jpeg",
        size: 5 * 1024 * 1024,
      }),
    ).toBe(true);
  });

  it("rejects non-image files", () => {
    expect(
      isAcceptedProductImage({ name: "a.txt", type: "text/plain", size: 100 }),
    ).toBe(false);
  });

  it("rejects files over the size limit", () => {
    expect(
      isAcceptedProductImage({
        name: "a.png",
        type: "image/png",
        size: 5 * 1024 * 1024 + 1,
      }),
    ).toBe(false);
  });
});

describe("buildProductImagePath", () => {
  it("builds a storage path inside the products folder", () => {
    const path = buildProductImagePath("photo.jpg");
    expect(path).toMatch(/^products\/[a-z0-9-]+\.[a-z]+$/);
  });

  it("preserves a lowercased extension", () => {
    const path = buildProductImagePath("photo.PNG");
    expect(path.endsWith(".png")).toBe(true);
  });

  it("omits the extension when the file name has none", () => {
    const path = buildProductImagePath("photo");
    expect(path).toMatch(/^products\/[a-z0-9-]+$/);
  });
});
