import type { OrderDraft } from "./orders";

export interface PaymentIntentShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentIntentShipping {
  name: string;
  address: PaymentIntentShippingAddress;
}

export interface PaymentIntentParams {
  amount: number;
  currency: string;
  automatic_payment_methods: { enabled: boolean };
  metadata: { order_id: string; user_id: string };
  shipping: PaymentIntentShipping;
  description: string;
}

export function buildPaymentIntentParams(
  draft: OrderDraft,
  orderId: string,
  shippingName: string,
): PaymentIntentParams {
  const trimmedOrderId = orderId.trim();
  if (trimmedOrderId.length === 0) {
    throw new Error("payment intent requires an order id");
  }

  const name = shippingName.trim();
  if (name.length === 0) {
    throw new Error("payment intent requires a shipping name");
  }

  const { line2, postalCode, country, ...address } = draft.shippingAddress;

  return {
    amount: draft.totalAmount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      order_id: trimmedOrderId,
      user_id: draft.userId,
    },
    shipping: {
      name,
      address: {
        ...address,
        postal_code: postalCode,
        country,
        ...(line2 ? { line2 } : {}),
      },
    },
    description: `Order ${trimmedOrderId}`,
  };
}
