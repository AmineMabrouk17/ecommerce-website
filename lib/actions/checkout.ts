"use server";

import { buildPaymentIntentParams } from "@/lib/checkout";
import { resolveCartLines, type CheckoutLineError } from "@/lib/data-access";
import {
  buildOrderDraft,
  shippingFormSchema,
  toOrderInsert,
  toOrderItemsInsert,
  type ShippingFormInput,
} from "@/lib/orders";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export interface CheckoutLineInput {
  productId: string;
  quantity: number;
}

export interface CheckoutLineSummary {
  name: string;
  quantity: number;
  lineTotal: number;
}

export interface CheckoutInput {
  form: ShippingFormInput;
  lines: CheckoutLineInput[];
}

export interface CheckoutActionResult {
  orderId?: string;
  clientSecret?: string;
  lines?: CheckoutLineSummary[];
  subtotal?: number;
  shippingAmount?: number;
  totalAmount?: number;
  error?: string;
  lineErrors?: CheckoutLineError[];
}

function firstIssueMessage(message: string): string {
  return message || "Something went wrong. Please try again.";
}

export async function createCheckoutPayment(
  input: CheckoutInput,
): Promise<CheckoutActionResult> {
  const parsedForm = shippingFormSchema.safeParse(input.form);
  if (!parsedForm.success) {
    return { error: firstIssueMessage(parsedForm.error.issues[0]?.message) };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to check out." };
  }

  const { lines, errors } = await resolveCartLines(input.lines);
  if (errors.length > 0) {
    return { error: "Some items in your cart are unavailable.", lineErrors: errors };
  }
  if (lines.length === 0) {
    return { error: "Your cart is empty." };
  }

  let draft;
  try {
    draft = buildOrderDraft(lines, parsedForm.data, user.id);
  } catch {
    return { error: "Your cart could not be checked out. Please review it." };
  }

  const orderId = crypto.randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    ...toOrderInsert(draft),
  });
  if (orderError) {
    return { error: "We could not create your order. Please try again." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(toOrderItemsInsert(orderId, draft));
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return { error: "We could not create your order. Please try again." };
  }

  let paymentIntent;
  try {
    const params = buildPaymentIntentParams(draft, orderId, parsedForm.data.name);
    paymentIntent = await getStripe().paymentIntents.create(params);
  } catch {
    await supabase.from("orders").delete().eq("id", orderId);
    return { error: "We could not start your payment. Please try again." };
  }

  const { error: intentLinkError } = await supabase
    .from("orders")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", orderId);
  if (intentLinkError || !paymentIntent.client_secret) {
    await getStripe().paymentIntents.cancel(paymentIntent.id);
    await supabase.from("orders").delete().eq("id", orderId);
    return { error: "We could not start your payment. Please try again." };
  }

  return {
    orderId,
    clientSecret: paymentIntent.client_secret,
    lines: draft.items.map((item) => ({
      name: item.productTitle,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: draft.subtotal,
    shippingAmount: draft.shippingAmount,
    totalAmount: draft.totalAmount,
  };
}
