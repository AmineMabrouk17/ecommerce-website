import { z } from "zod";

import type { OrderStatus } from "./orders";

export const REVIEWABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  "paid",
  "delivered",
];

export function isReviewableOrderStatus(status: OrderStatus): boolean {
  return REVIEWABLE_ORDER_STATUSES.includes(status);
}

export const reviewFormSchema = z.object({
  productId: z.string().trim().min(1, "Product is required"),
  rating: z
    .number({ message: "Select a rating" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().trim().min(1, "Comment is required"),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;

export interface ReviewOrderItem {
  productId: string;
}

export interface ReviewOrder {
  status: OrderStatus;
  items: ReviewOrderItem[];
}

export type ReviewEligibilityReason = "not-verified" | "already-reviewed";

export type ReviewEligibility =
  | { eligible: true }
  | { eligible: false; reason: ReviewEligibilityReason };

export function checkReviewEligibility(
  orders: ReviewOrder[],
  reviewedProductIds: readonly string[],
  productId: string,
): ReviewEligibility {
  const verifiedPurchase = orders.some(
    (order) =>
      isReviewableOrderStatus(order.status) &&
      order.items.some((item) => item.productId === productId),
  );
  if (!verifiedPurchase) {
    return { eligible: false, reason: "not-verified" };
  }
  if (reviewedProductIds.includes(productId)) {
    return { eligible: false, reason: "already-reviewed" };
  }
  return { eligible: true };
}

export interface ReviewRating {
  rating: number;
}

export interface ReviewSummary {
  count: number;
  average: number;
}

export function reviewSummary(reviews: ReviewRating[]): ReviewSummary {
  if (reviews.length === 0) {
    return { count: 0, average: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    count: reviews.length,
    average: Math.round((total / reviews.length) * 10) / 10,
  };
}
