"use server";

import { revalidatePath } from "next/cache";

import { getAdminAccess, getAdminOrder } from "@/lib/data-access";
import { reduceAdminOrderAction } from "@/lib/orders-admin";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface AdminOrderActionResult {
  error?: string;
}

async function requireAdmin(): Promise<string | null> {
  const { isAuthenticated, isAdmin } = await getAdminAccess();
  if (!isAuthenticated) return "You must be signed in to manage orders.";
  if (!isAdmin) return "You do not have permission to manage orders.";
  return null;
}

function orderIdError(orderId: string): string | null {
  if (typeof orderId !== "string" || orderId.trim().length === 0) {
    return "Order is required.";
  }
  return null;
}

export async function advanceOrder(
  orderId: string,
): Promise<AdminOrderActionResult> {
  const accessError = await requireAdmin();
  if (accessError) return { error: accessError };
  const idError = orderIdError(orderId);
  if (idError) return { error: idError };

  const order = await getAdminOrder(orderId);
  if (!order) return { error: "Order not found." };

  const transition = reduceAdminOrderAction(order, { kind: "advance" });
  if (transition.noOp) {
    return { error: "This order cannot be advanced." };
  }

  const supabase = createClient();
  const { error, count } = await supabase
    .from("orders")
    .update({ status: transition.status }, { count: "exact" })
    .eq("id", order.id)
    .eq("status", order.status);
  if (error) {
    return { error: "We could not update this order. Please try again." };
  }
  if (count === 0) {
    return { error: "This order changed status. Please refresh and try again." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  return {};
}

export async function cancelOrder(
  orderId: string,
): Promise<AdminOrderActionResult> {
  const accessError = await requireAdmin();
  if (accessError) return { error: accessError };
  const idError = orderIdError(orderId);
  if (idError) return { error: idError };

  const order = await getAdminOrder(orderId);
  if (!order) return { error: "Order not found." };

  const transition = reduceAdminOrderAction(order, { kind: "cancel" });
  if (transition.noOp) {
    return { error: "This order cannot be cancelled." };
  }

  const refund = transition.effects.find((effect) => effect.kind === "refund");
  if (refund) {
    if (!order.stripePaymentIntentId) {
      return {
        error: "We could not refund this order because it has no payment record.",
      };
    }
    try {
      await getStripe().refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
    } catch {
      return { error: "We could not refund this order. Please try again." };
    }
  }

  const supabase = createClient();
  const { error: updateError, count } = await supabase
    .from("orders")
    .update({ status: transition.status }, { count: "exact" })
    .eq("id", order.id)
    .eq("status", order.status);
  if (updateError) {
    return { error: "We could not cancel this order. Please try again." };
  }
  if (count === 0) {
    return { error: "This order changed status. Please refresh and try again." };
  }

  const restores = transition.effects.filter(
    (effect) => effect.kind === "restore",
  );
  if (restores.length > 0) {
    const admin = createAdminClient();
    for (const restore of restores) {
      const { error: restoreError } = await admin.rpc("restore_stock", {
        p_product_id: restore.productId,
        p_quantity: restore.quantity,
      });
      if (restoreError) {
        console.error(
          `restore_stock failed for order ${order.id}`,
          restoreError,
        );
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  return {};
}
