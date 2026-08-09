import type { OrderSnapshot, OrderStatus, OrderTransition } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export interface WebhookOrder extends OrderSnapshot {
  orderId: string;
}

interface OrderRow {
  id: string;
  status: OrderStatus;
  order_items: { product_id: string; quantity: number }[];
}

export async function getOrderByPaymentIntentId(
  paymentIntentId: string,
): Promise<WebhookOrder | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("id, status, order_items(product_id, quantity)")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (error) throw error;

  const row = data as OrderRow | null;
  if (row === null) return null;

  return {
    orderId: row.id,
    status: row.status,
    items: row.order_items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    })),
  };
}

export async function applyOrderTransition(
  order: WebhookOrder,
  transition: OrderTransition,
): Promise<void> {
  const admin = createAdminClient();

  const { error: transitionError, count } = await admin
    .from("orders")
    .update({ status: transition.status }, { count: "exact" })
    .eq("id", order.orderId)
    .eq("status", order.status);
  if (transitionError) throw transitionError;

  if (count === 0) {
    return;
  }

  let guardFailed = false;
  for (const effect of transition.effects) {
    if (effect.kind !== "decrement") continue;
    const { data: applied, error } = await admin.rpc(
      "decrement_stock_if_available",
      {
        p_product_id: effect.productId,
        p_quantity: effect.quantity,
      },
    );
    if (error) throw error;
    if (applied === false) guardFailed = true;
  }

  if (guardFailed) {
    const { error: flagError } = await admin
      .from("orders")
      .update({ stock_guard_failed: true })
      .eq("id", order.orderId);
    if (flagError) throw flagError;
  }
}
