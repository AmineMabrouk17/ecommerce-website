import { describe, expect, it } from "vitest";

import {
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  cartSubtotal,
  orderTotal,
  shippingAmount,
} from "@/lib/pricing";

describe("cartSubtotal", () => {
  it("sums unit price times quantity in integer cents", () => {
    expect(
      cartSubtotal([
        { price: 2499, quantity: 2 },
        { price: 14900, quantity: 1 },
        { price: 5, quantity: 3 },
      ]),
    ).toBe(19898 + 15);
  });

  it("sums a single line with quantity", () => {
    expect(cartSubtotal([{ price: 1999, quantity: 3 }])).toBe(5997);
  });

  it("is zero for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
  });

  it("throws on a non-integer unit price", () => {
    expect(() =>
      cartSubtotal([{ price: 19.99, quantity: 1 }]),
    ).toThrow(RangeError);
  });

  it("throws on a non-integer quantity", () => {
    expect(() =>
      cartSubtotal([{ price: 1999, quantity: 1.5 }]),
    ).toThrow(RangeError);
  });
});

describe("shippingAmount", () => {
  it("is the flat rate for a zero subtotal", () => {
    expect(shippingAmount(0)).toBe(FLAT_SHIPPING_CENTS);
  });

  it("is the flat rate below the free-shipping threshold", () => {
    expect(shippingAmount(4999)).toBe(FLAT_SHIPPING_CENTS);
  });

  it("is the flat rate exactly at the free-shipping threshold", () => {
    expect(shippingAmount(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(
      FLAT_SHIPPING_CENTS,
    );
  });

  it("is waived once the subtotal exceeds the threshold", () => {
    expect(shippingAmount(5001)).toBe(0);
    expect(shippingAmount(25000)).toBe(0);
  });

  it("exposes the flat rate and threshold in cents", () => {
    expect(FLAT_SHIPPING_CENTS).toBe(500);
    expect(FREE_SHIPPING_THRESHOLD_CENTS).toBe(5000);
  });

  it("throws on a non-integer subtotal", () => {
    expect(() => shippingAmount(50.5)).toThrow(RangeError);
  });
});

describe("orderTotal", () => {
  it("adds shipping below the threshold", () => {
    expect(orderTotal(0)).toBe(500);
    expect(orderTotal(4999)).toBe(5499);
  });

  it("adds shipping exactly at the threshold", () => {
    expect(orderTotal(5000)).toBe(5500);
  });

  it("waives shipping above the threshold", () => {
    expect(orderTotal(5001)).toBe(5001);
    expect(orderTotal(25000)).toBe(25000);
  });

  it("throws on a non-integer subtotal", () => {
    expect(() => orderTotal(50.5)).toThrow(RangeError);
  });
});

describe("cart to order total", () => {
  it("computes subtotal, shipping, and total for a real cart", () => {
    const subtotal = cartSubtotal([
      { price: 2499, quantity: 1 },
      { price: 14900, quantity: 1 },
    ]);
    expect(subtotal).toBe(17399);
    expect(shippingAmount(subtotal)).toBe(0);
    expect(orderTotal(subtotal)).toBe(17399);
  });
});
