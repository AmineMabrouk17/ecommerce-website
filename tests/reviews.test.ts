import { describe, expect, it } from "vitest";

import type { OrderStatus } from "@/lib/orders";
import {
  checkReviewEligibility,
  isReviewableOrderStatus,
  reviewFormSchema,
  reviewSummary,
  type ReviewFormInput,
  type ReviewOrder,
} from "@/lib/reviews";

const productId = "c0ffee00-0000-4000-8000-000000000001";

const validInput: ReviewFormInput = {
  productId,
  rating: 5,
  comment: "Great fit and fast shipping.",
};

function orderWith(status: OrderStatus, items: string[] = [productId]): ReviewOrder {
  return { status, items: items.map((id) => ({ productId: id })) };
}

describe("reviewFormSchema", () => {
  it("accepts a valid review", () => {
    expect(reviewFormSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts ratings of 1 and 5", () => {
    expect(
      reviewFormSchema.safeParse({ ...validInput, rating: 1 }).success,
    ).toBe(true);
    expect(
      reviewFormSchema.safeParse({ ...validInput, rating: 5 }).success,
    ).toBe(true);
  });

  it("rejects a rating below 1", () => {
    expect(
      reviewFormSchema.safeParse({ ...validInput, rating: 0 }).success,
    ).toBe(false);
  });

  it("rejects a rating above 5", () => {
    expect(
      reviewFormSchema.safeParse({ ...validInput, rating: 6 }).success,
    ).toBe(false);
  });

  it("rejects a non-integer rating", () => {
    expect(
      reviewFormSchema.safeParse({ ...validInput, rating: 4.5 }).success,
    ).toBe(false);
  });

  it("trims the comment and product id", () => {
    const parsed = reviewFormSchema.parse({
      productId: `  ${productId}  `,
      rating: 4,
      comment: "  Solid quality.  ",
    });
    expect(parsed.productId).toBe(productId);
    expect(parsed.comment).toBe("Solid quality.");
  });

  it("rejects a missing comment", () => {
    expect(
      reviewFormSchema.safeParse({ ...validInput, comment: "   " }).success,
    ).toBe(false);
  });

  it("rejects a missing product id", () => {
    expect(
      reviewFormSchema.safeParse({ ...validInput, productId: "" }).success,
    ).toBe(false);
  });
});

describe("isReviewableOrderStatus", () => {
  it("returns true for paid and delivered orders", () => {
    expect(isReviewableOrderStatus("paid")).toBe(true);
    expect(isReviewableOrderStatus("delivered")).toBe(true);
  });

  it("returns false for pending, shipped, and cancelled orders", () => {
    expect(isReviewableOrderStatus("pending")).toBe(false);
    expect(isReviewableOrderStatus("shipped")).toBe(false);
    expect(isReviewableOrderStatus("cancelled")).toBe(false);
  });
});

describe("checkReviewEligibility", () => {
  it("is eligible when a paid order contains the product", () => {
    expect(checkReviewEligibility([orderWith("paid")], [], productId)).toEqual({
      eligible: true,
    });
  });

  it("is eligible when a delivered order contains the product", () => {
    expect(
      checkReviewEligibility([orderWith("delivered")], [], productId),
    ).toEqual({ eligible: true });
  });

  it("is not eligible when only a pending order contains the product", () => {
    expect(checkReviewEligibility([orderWith("pending")], [], productId)).toEqual({
      eligible: false,
      reason: "not-verified",
    });
  });

  it("is not eligible when only a shipped order contains the product", () => {
    expect(checkReviewEligibility([orderWith("shipped")], [], productId)).toEqual({
      eligible: false,
      reason: "not-verified",
    });
  });

  it("is not eligible when only a cancelled order contains the product", () => {
    expect(checkReviewEligibility([orderWith("cancelled")], [], productId)).toEqual(
      { eligible: false, reason: "not-verified" },
    );
  });

  it("is not eligible when no order contains the product", () => {
    expect(
      checkReviewEligibility(
        [orderWith("paid", ["other-product"])],
        [],
        productId,
      ),
    ).toEqual({ eligible: false, reason: "not-verified" });
  });

  it("is not eligible when the product was already reviewed", () => {
    expect(
      checkReviewEligibility([orderWith("delivered")], [productId], productId),
    ).toEqual({ eligible: false, reason: "already-reviewed" });
  });

  it("is eligible when the customer reviewed other products", () => {
    expect(
      checkReviewEligibility(
        [orderWith("paid")],
        ["another-product"],
        productId,
      ),
    ).toEqual({ eligible: true });
  });
});

describe("reviewSummary", () => {
  it("returns an empty summary when there are no reviews", () => {
    expect(reviewSummary([])).toEqual({ count: 0, average: 0 });
  });

  it("computes the count and average rating", () => {
    expect(
      reviewSummary([{ rating: 5 }, { rating: 4 }, { rating: 3 }]),
    ).toEqual({ count: 3, average: 4 });
  });

  it("rounds the average to one decimal place", () => {
    expect(reviewSummary([{ rating: 5 }, { rating: 5 }, { rating: 4 }])).toEqual({
      count: 3,
      average: 4.7,
    });
  });
});
