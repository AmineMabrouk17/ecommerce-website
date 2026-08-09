import { describe, expect, it } from "vitest";

import {
  FLAT_SHIPPING_CENTS,
  cartSubtotal,
  orderTotal,
  shippingAmount,
} from "@/lib/pricing";
import {
  buildOrderDraft,
  parsePaymentEvent,
  reducePaymentEvent,
  reduceRefund,
  shippingFormSchema,
  toOrderInsert,
  toOrderItemsInsert,
  type OrderDraftLineInput,
  type OrderSnapshot,
  type ShippingFormInput,
} from "@/lib/orders";

const validForm: ShippingFormInput = {
  name: "Avery Park",
  email: "avery@example.com",
  address: {
    line1: "1 Main St",
    city: "Denver",
    state: "CO",
    postalCode: "80202",
    country: "US",
  },
};

describe("shippingFormSchema", () => {
  it("accepts a complete valid shipping form", () => {
    expect(shippingFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("trims name, email, and address fields", () => {
    const parsed = shippingFormSchema.parse({
      name: "  Avery Park  ",
      email: " avery@example.com ",
      address: { ...validForm.address, line1: "  1 Main St  " },
    });
    expect(parsed.name).toBe("Avery Park");
    expect(parsed.email).toBe("avery@example.com");
    expect(parsed.address.line1).toBe("1 Main St");
  });

  it("rejects a missing name", () => {
    expect(shippingFormSchema.safeParse({ ...validForm, name: "" }).success).toBe(
      false,
    );
  });

  it("rejects an invalid email", () => {
    expect(
      shippingFormSchema.safeParse({ ...validForm, email: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("rejects an address missing a required field", () => {
    const { line1, ...withoutLine1 } = validForm.address;
    expect(
      shippingFormSchema.safeParse({ ...validForm, address: withoutLine1 })
        .success,
    ).toBe(false);
  });

  it("treats a blank line2 as absent", () => {
    const parsed = shippingFormSchema.parse({
      ...validForm,
      address: { ...validForm.address, line2: "" },
    });
    expect(parsed.address.line2).toBeUndefined();
  });

  it("keeps a provided line2", () => {
    const parsed = shippingFormSchema.parse({
      ...validForm,
      address: { ...validForm.address, line2: "Apt 2B" },
    });
    expect(parsed.address.line2).toBe("Apt 2B");
  });
});

describe("buildOrderDraft", () => {
  const shipping: ShippingFormInput = validForm;

  const line = (
    overrides: Partial<OrderDraftLineInput> = {},
  ): OrderDraftLineInput => ({
    productId: "prod-1",
    name: "Lumina Everyday Tee",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    price: 2499,
    quantity: 2,
    ...overrides,
  });

  it("builds a pending draft carrying the user id and shipping address", () => {
    const draft = buildOrderDraft([line()], shipping, "user-1");

    expect(draft.userId).toBe("user-1");
    expect(draft.status).toBe("pending");
    expect(draft.shippingAddress).toEqual(shipping.address);
  });

  it("snapshots product title, image, and unit price per order item", () => {
    const draft = buildOrderDraft(
      [
        line({ productId: "p1", name: "Lumina Everyday Tee", price: 2499, quantity: 2 }),
        line({
          productId: "p2",
          name: "Halo Wireless Headphones",
          image: null,
          price: 14900,
          quantity: 1,
        }),
      ],
      shipping,
      "user-1",
    );

    expect(draft.items).toHaveLength(2);
    expect(draft.items[0]).toEqual({
      productId: "p1",
      quantity: 2,
      unitPrice: 2499,
      productTitle: "Lumina Everyday Tee",
      productImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      lineTotal: 4998,
    });
    expect(draft.items[1].productTitle).toBe("Halo Wireless Headphones");
    expect(draft.items[1].productImage).toBeNull();
    expect(draft.items[1].lineTotal).toBe(14900);
  });

  it("mirrors the pricing module subtotal, shipping, and total exactly", () => {
    const lines = [
      line({ price: 2499, quantity: 1 }),
      line({ productId: "p2", name: "Halo Wireless Headphones", price: 14900, quantity: 1 }),
    ];
    const subtotal = cartSubtotal(lines);

    const draft = buildOrderDraft(lines, shipping, "user-1");

    expect(draft.subtotal).toBe(subtotal);
    expect(draft.shippingAmount).toBe(shippingAmount(subtotal));
    expect(draft.totalAmount).toBe(orderTotal(subtotal));
  });

  it("applies the flat shipping rate below the free-shipping threshold", () => {
    const draft = buildOrderDraft([line({ price: 1000, quantity: 1 })], shipping, "user-1");

    expect(draft.subtotal).toBe(1000);
    expect(draft.shippingAmount).toBe(FLAT_SHIPPING_CENTS);
    expect(draft.totalAmount).toBe(1500);
  });

  it("waives shipping above the free-shipping threshold", () => {
    const draft = buildOrderDraft([line({ price: 14900, quantity: 1 })], shipping, "user-1");

    expect(draft.subtotal).toBe(14900);
    expect(draft.shippingAmount).toBe(0);
    expect(draft.totalAmount).toBe(14900);
  });

  it("rejects an empty cart", () => {
    expect(() => buildOrderDraft([], shipping, "user-1")).toThrow();
  });

  it("rejects a non-integer unit price", () => {
    expect(() =>
      buildOrderDraft([line({ price: 19.99 })], shipping, "user-1"),
    ).toThrow(RangeError);
  });

  it("rejects a non-positive quantity", () => {
    expect(() =>
      buildOrderDraft([line({ quantity: 0 })], shipping, "user-1"),
    ).toThrow();
    expect(() =>
      buildOrderDraft([line({ quantity: -2 })], shipping, "user-1"),
    ).toThrow();
  });

  it("rejects a non-integer quantity", () => {
    expect(() =>
      buildOrderDraft([line({ quantity: 1.5 })], shipping, "user-1"),
    ).toThrow();
  });

  it("rejects a line missing a product id or title", () => {
    expect(() =>
      buildOrderDraft([line({ productId: "" })], shipping, "user-1"),
    ).toThrow();
    expect(() =>
      buildOrderDraft([line({ name: "" })], shipping, "user-1"),
    ).toThrow();
  });

  it("rejects invalid shipping data", () => {
    expect(() =>
      buildOrderDraft([line()], { ...shipping, email: "not-an-email" }, "user-1"),
    ).toThrow();
  });
});

describe("order insert mapping", () => {
  const shipping: ShippingFormInput = validForm;

  const draft = buildOrderDraft(
    [
      {
        productId: "p1",
        name: "Lumina Everyday Tee",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        price: 2499,
        quantity: 2,
      },
      {
        productId: "p2",
        name: "Halo Wireless Headphones",
        image: null,
        price: 14900,
        quantity: 1,
      },
    ],
    shipping,
    "user-1",
  );

  it("maps the draft to the orders insert shape", () => {
    expect(toOrderInsert(draft)).toEqual({
      user_id: "user-1",
      status: "pending",
      total_amount: draft.totalAmount,
      shipping_amount: draft.shippingAmount,
      shipping_address: draft.shippingAddress,
    });
  });

  it("does not leak subtotal or items into the orders insert", () => {
    const insert = toOrderInsert(draft) as unknown as Record<string, unknown>;
    expect(insert).not.toHaveProperty("subtotal");
    expect(insert).not.toHaveProperty("items");
  });

  it("maps each order item to the order_items insert shape", () => {
    expect(toOrderItemsInsert("order-1", draft)).toEqual([
      {
        order_id: "order-1",
        product_id: "p1",
        quantity: 2,
        unit_price: 2499,
        product_title: "Lumina Everyday Tee",
        product_image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      },
      {
        order_id: "order-1",
        product_id: "p2",
        quantity: 1,
        unit_price: 14900,
        product_title: "Halo Wireless Headphones",
        product_image: null,
      },
    ]);
  });
});

describe("reducePaymentEvent", () => {
  const pendingOrder: OrderSnapshot = {
    status: "pending",
    items: [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ],
  };

  it("transitions a pending order to paid on payment_intent.succeeded", () => {
    const transition = reducePaymentEvent(pendingOrder, {
      type: "payment_intent.succeeded",
    });

    expect(transition.noOp).toBe(false);
    expect(transition.status).toBe("paid");
  });

  it("emits a decrement effect for each order item", () => {
    const transition = reducePaymentEvent(pendingOrder, {
      type: "payment_intent.succeeded",
    });

    expect(transition.effects).toEqual([
      { kind: "decrement", productId: "p1", quantity: 2, guardFailed: false },
      { kind: "decrement", productId: "p2", quantity: 1, guardFailed: false },
    ]);
  });

  it("cancels a pending order on payment_intent.payment_failed", () => {
    const transition = reducePaymentEvent(pendingOrder, {
      type: "payment_intent.payment_failed",
    });

    expect(transition.noOp).toBe(false);
    expect(transition.status).toBe("cancelled");
    expect(transition.effects).toEqual([]);
  });

  it("cancels a pending order on payment_intent.canceled", () => {
    const transition = reducePaymentEvent(pendingOrder, {
      type: "payment_intent.canceled",
    });

    expect(transition.noOp).toBe(false);
    expect(transition.status).toBe("cancelled");
    expect(transition.effects).toEqual([]);
  });

  it("flags the stock decrement when available stock is insufficient", () => {
    const transition = reducePaymentEvent(
      pendingOrder,
      { type: "payment_intent.succeeded" },
      { p1: 1 },
    );

    expect(transition.status).toBe("paid");
    expect(transition.effects).toEqual([
      { kind: "decrement", productId: "p1", quantity: 2, guardFailed: true },
      { kind: "decrement", productId: "p2", quantity: 1, guardFailed: false },
    ]);
  });

  it("does not flag the decrement when available stock meets the quantity", () => {
    const transition = reducePaymentEvent(
      pendingOrder,
      { type: "payment_intent.succeeded" },
      { p1: 2, p2: 1 },
    );

    expect(
      transition.effects.every(
        (effect) => effect.kind !== "decrement" || !effect.guardFailed,
      ),
    ).toBe(true);
  });

  it("is a no-op when a paid order replays payment_intent.succeeded", () => {
    const transition = reducePaymentEvent(
      { ...pendingOrder, status: "paid" },
      { type: "payment_intent.succeeded" },
    );

    expect(transition.noOp).toBe(true);
    expect(transition.status).toBe("paid");
    expect(transition.effects).toEqual([]);
  });

  it("is a no-op for any payment event on a paid order", () => {
    const events = [
      { type: "payment_intent.payment_failed" as const },
      { type: "payment_intent.canceled" as const },
    ];

    for (const event of events) {
      const transition = reducePaymentEvent(
        { ...pendingOrder, status: "paid" },
        event,
      );

      expect(transition.noOp).toBe(true);
      expect(transition.status).toBe("paid");
      expect(transition.effects).toEqual([]);
    }
  });

  it("is a no-op for any payment event on a cancelled order", () => {
    const events = [
      { type: "payment_intent.succeeded" as const },
      { type: "payment_intent.payment_failed" as const },
      { type: "payment_intent.canceled" as const },
    ];

    for (const event of events) {
      const transition = reducePaymentEvent(
        { ...pendingOrder, status: "cancelled" },
        event,
      );

      expect(transition.noOp).toBe(true);
      expect(transition.status).toBe("cancelled");
      expect(transition.effects).toEqual([]);
    }
  });

  it("is a no-op for any payment event on shipped and delivered orders", () => {
    const events = [
      { type: "payment_intent.succeeded" as const },
      { type: "payment_intent.payment_failed" as const },
      { type: "payment_intent.canceled" as const },
    ];

    for (const status of ["shipped", "delivered"] as const) {
      for (const event of events) {
        const transition = reducePaymentEvent(
          { ...pendingOrder, status },
          event,
        );

        expect(transition.noOp).toBe(true);
        expect(transition.status).toBe(status);
        expect(transition.effects).toEqual([]);
      }
    }
  });
});

describe("reduceRefund", () => {
  const paidOrder: OrderSnapshot = {
    status: "paid",
    items: [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ],
  };

  it("cancels a paid order and restores stock for each item", () => {
    const transition = reduceRefund(paidOrder);

    expect(transition.noOp).toBe(false);
    expect(transition.status).toBe("cancelled");
    expect(transition.effects).toEqual([
      { kind: "restore", productId: "p1", quantity: 2 },
      { kind: "restore", productId: "p2", quantity: 1 },
    ]);
  });

  it("is a no-op for a pending order", () => {
    const transition = reduceRefund({ ...paidOrder, status: "pending" });

    expect(transition.noOp).toBe(true);
    expect(transition.status).toBe("pending");
    expect(transition.effects).toEqual([]);
  });

  it("is a no-op for cancelled, shipped, and delivered orders", () => {
    for (const status of ["cancelled", "shipped", "delivered"] as const) {
      const transition = reduceRefund({ ...paidOrder, status });

      expect(transition.noOp).toBe(true);
      expect(transition.status).toBe(status);
      expect(transition.effects).toEqual([]);
    }
  });
});

describe("parsePaymentEvent", () => {
  it("dispatches payment_intent.succeeded with its payment intent id", () => {
    const dispatch = parsePaymentEvent({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_123" } },
    });

    expect(dispatch).toEqual({
      paymentIntentId: "pi_123",
      event: { type: "payment_intent.succeeded" },
    });
  });

  it("dispatches payment_intent.payment_failed and canceled with their ids", () => {
    for (const type of [
      "payment_intent.payment_failed",
      "payment_intent.canceled",
    ] as const) {
      const dispatch = parsePaymentEvent({
        type,
        data: { object: { id: "pi_123" } },
      });

      expect(dispatch).toEqual({ paymentIntentId: "pi_123", event: { type } });
    }
  });

  it("returns null for unhandled event types", () => {
    for (const type of [
      "charge.refunded",
      "checkout.session.completed",
      "payment_intent.requires_action",
    ]) {
      expect(
        parsePaymentEvent({ type, data: { object: { id: "pi_123" } } }),
      ).toBeNull();
    }
  });

  it("returns null for a non-object payload", () => {
    expect(parsePaymentEvent(null)).toBeNull();
    expect(parsePaymentEvent("payment_intent.succeeded")).toBeNull();
  });

  it("throws when a handled event is missing its payment intent object", () => {
    expect(() => parsePaymentEvent({ type: "payment_intent.succeeded" })).toThrow();
  });

  it("throws when a handled event has an empty payment intent id", () => {
    expect(() =>
      parsePaymentEvent({
        type: "payment_intent.succeeded",
        data: { object: {} },
      }),
    ).toThrow("payment intent id");
  });
});
