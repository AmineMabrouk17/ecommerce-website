"use server";

import type { OrderStatus } from "@/lib/orders";
import {
  checkReviewEligibility,
  reviewFormSchema,
  type ReviewFormInput,
  type ReviewOrder,
} from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";

interface OrderRow {
  status: OrderStatus;
  order_items: { product_id: string }[];
}

interface ReviewRow {
  product_id: string;
}

export interface SubmitReviewResult {
  error?: string;
}

function firstIssueMessage(message: string): string {
  return message || "Something went wrong. Please try again.";
}

function eligibilityMessage(reason: "not-verified" | "already-reviewed"): string {
  return reason === "not-verified"
    ? "You can only review products you have purchased."
    : "You have already reviewed this product.";
}

export async function submitReview(
  input: ReviewFormInput,
): Promise<SubmitReviewResult> {
  const parsed = reviewFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to write a review." };
  }

  const { data: orderRows } = await supabase
    .from("orders")
    .select("status, order_items(product_id)")
    .eq("user_id", user.id);

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("product_id")
    .eq("user_id", user.id);

  const eligibility = checkReviewEligibility(
    ((orderRows ?? []) as OrderRow[]).map((order): ReviewOrder => ({
      status: order.status,
      items: order.order_items.map((item) => ({ productId: item.product_id })),
    })),
    ((reviewRows ?? []) as ReviewRow[]).map((review) => review.product_id),
    parsed.data.productId,
  );

  if (!eligibility.eligible) {
    return { error: eligibilityMessage(eligibility.reason) };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: parsed.data.productId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });
  if (error) {
    if (error.code === "23505") {
      return { error: "You have already reviewed this product." };
    }
    return { error: "We could not save your review. Please try again." };
  }

  return {};
}
