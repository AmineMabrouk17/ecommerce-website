import { z } from "zod";

import { multiplyCents } from "./money";
import { cartSubtotal, orderTotal, shippingAmount } from "./pricing";

const optionalLine = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const shippingAddressSchema = z.object({
  line1: z.string().trim().min(1, "Address is required"),
  line2: optionalLine,
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const shippingFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  address: shippingAddressSchema,
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type ShippingFormInput = z.infer<typeof shippingFormSchema>;

export interface OrderDraftLineInput {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
}

export interface OrderDraftItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productTitle: string;
  productImage: string | null;
  lineTotal: number;
}

export interface OrderDraft {
  userId: string;
  status: "pending";
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  items: OrderDraftItem[];
}

export function buildOrderDraft(
  lines: OrderDraftLineInput[],
  shipping: ShippingFormInput,
  userId: string,
): OrderDraft {
  if (lines.length === 0) {
    throw new Error("cannot build an order draft from an empty cart");
  }

  const shippingData = shippingFormSchema.parse(shipping);

  const items = lines.map((line) => {
    const productId = line.productId.trim();
    if (productId.length === 0) {
      throw new Error("order draft line requires a product id");
    }
    const productTitle = line.name.trim();
    if (productTitle.length === 0) {
      throw new Error("order draft line requires a product title");
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error(
        `order draft line quantity must be a positive integer, got ${line.quantity}`,
      );
    }
    return {
      productId,
      quantity: line.quantity,
      unitPrice: line.price,
      productTitle,
      productImage: line.image,
      lineTotal: multiplyCents(line.price, line.quantity),
    };
  });

  const subtotal = cartSubtotal(lines);

  return {
    userId,
    status: "pending",
    subtotal,
    shippingAmount: shippingAmount(subtotal),
    totalAmount: orderTotal(subtotal),
    shippingAddress: shippingData.address,
    items,
  };
}

export interface OrderInsert {
  user_id: string;
  status: "pending";
  total_amount: number;
  shipping_amount: number;
  shipping_address: ShippingAddress;
}

export interface OrderItemInsert {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_title: string;
  product_image: string | null;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type PaymentEventType =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "payment_intent.canceled";

export interface PaymentEvent {
  type: PaymentEventType;
}

export interface OrderLine {
  productId: string;
  quantity: number;
}

export interface OrderSnapshot {
  status: OrderStatus;
  items: OrderLine[];
}

export type StockEffect =
  | { kind: "decrement"; productId: string; quantity: number; guardFailed: boolean }
  | { kind: "restore"; productId: string; quantity: number };

export interface OrderTransition {
  status: OrderStatus;
  effects: StockEffect[];
  noOp: boolean;
}

function decrementEffects(
  order: OrderSnapshot,
  availableStock: Record<string, number>,
): StockEffect[] {
  return order.items.map((item) => ({
    kind: "decrement" as const,
    productId: item.productId,
    quantity: item.quantity,
    guardFailed: (availableStock[item.productId] ?? Infinity) < item.quantity,
  }));
}

export function reducePaymentEvent(
  order: OrderSnapshot,
  event: PaymentEvent,
  availableStock: Record<string, number> = {},
): OrderTransition {
  if (order.status !== "pending") {
    return { status: order.status, effects: [], noOp: true };
  }

  if (event.type === "payment_intent.succeeded") {
    return {
      status: "paid",
      effects: decrementEffects(order, availableStock),
      noOp: false,
    };
  }

  return { status: order.status, effects: [], noOp: true };
}

export function toOrderInsert(draft: OrderDraft): OrderInsert {
  return {
    user_id: draft.userId,
    status: draft.status,
    total_amount: draft.totalAmount,
    shipping_amount: draft.shippingAmount,
    shipping_address: draft.shippingAddress,
  };
}

export function toOrderItemsInsert(
  orderId: string,
  draft: OrderDraft,
): OrderItemInsert[] {
  return draft.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    product_title: item.productTitle,
    product_image: item.productImage,
  }));
}
