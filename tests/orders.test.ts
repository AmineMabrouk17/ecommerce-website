import { describe, expect, it } from "vitest";

import {
  FLAT_SHIPPING_CENTS,
  cartSubtotal,
  orderTotal,
  shippingAmount,
} from "@/lib/pricing";
import {
  buildOrderDraft,
  shippingFormSchema,
  toOrderInsert,
  toOrderItemsInsert,
  type OrderDraftLineInput,
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
