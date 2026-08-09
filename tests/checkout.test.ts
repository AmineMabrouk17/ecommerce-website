import { describe, expect, it } from "vitest";

import { buildPaymentIntentParams } from "@/lib/checkout";
import { buildOrderDraft, type OrderDraft, type ShippingFormInput } from "@/lib/orders";

const shipping: ShippingFormInput = {
  name: "Avery Park",
  email: "avery@example.com",
  address: {
    line1: "1 Main St",
    line2: "Apt 2B",
    city: "Denver",
    state: "CO",
    postalCode: "80202",
    country: "US",
  },
};

function buildDraft(overrides: Partial<ShippingFormInput> = {}): OrderDraft {
  return buildOrderDraft(
    [
      {
        productId: "p1",
        name: "Lumina Everyday Tee",
        image: null,
        price: 2499,
        quantity: 2,
      },
    ],
    { ...shipping, ...overrides },
    "user-1",
  );
}

describe("buildPaymentIntentParams", () => {
  it("mirrors the draft total amount in cents", () => {
    const draft = buildDraft();
    const params = buildPaymentIntentParams(draft, "order-1", "Avery Park");

    expect(params.amount).toBe(draft.totalAmount);
  });

  it("sets usd currency with automatic payment methods enabled", () => {
    const params = buildPaymentIntentParams(buildDraft(), "order-1", "Avery Park");

    expect(params.currency).toBe("usd");
    expect(params.automatic_payment_methods).toEqual({ enabled: true });
  });

  it("carries the order and user ids in metadata", () => {
    const params = buildPaymentIntentParams(buildDraft(), "order-1", "Avery Park");

    expect(params.metadata).toEqual({ order_id: "order-1", user_id: "user-1" });
  });

  it("maps the shipping name and address to stripe's shape", () => {
    const params = buildPaymentIntentParams(buildDraft(), "order-1", "Avery Park");

    expect(params.shipping).toEqual({
      name: "Avery Park",
      address: {
        line1: "1 Main St",
        line2: "Apt 2B",
        city: "Denver",
        state: "CO",
        postal_code: "80202",
        country: "US",
      },
    });
  });

  it("omits line2 when the address has none", () => {
    const draft = buildDraft({
      address: { ...shipping.address, line2: undefined },
    });
    const params = buildPaymentIntentParams(draft, "order-1", "Avery Park");

    expect(params.shipping.address).not.toHaveProperty("line2");
  });

  it("trims the shipping name", () => {
    const params = buildPaymentIntentParams(buildDraft(), "order-1", "  Avery Park  ");

    expect(params.shipping.name).toBe("Avery Park");
  });

  it("describes the intent by order id", () => {
    const params = buildPaymentIntentParams(buildDraft(), "order-1", "Avery Park");

    expect(params.description).toBe("Order order-1");
  });

  it("rejects a blank shipping name", () => {
    expect(() => buildPaymentIntentParams(buildDraft(), "order-1", "  ")).toThrow();
  });

  it("rejects a blank order id", () => {
    expect(() => buildPaymentIntentParams(buildDraft(), " ", "Avery Park")).toThrow();
  });
});
