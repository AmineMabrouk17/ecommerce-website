import { describe, expect, it } from "vitest";

import { addCents, formatPrice, multiplyCents, subtractCents } from "@/lib/money";

describe("formatPrice", () => {
  it("formats zero cents as $0.00", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats whole dollars", () => {
    expect(formatPrice(1999)).toBe("$19.99");
  });

  it("formats amounts under one dollar", () => {
    expect(formatPrice(5)).toBe("$0.05");
  });

  it("adds thousands separators", () => {
    expect(formatPrice(1234567)).toBe("$12,345.67");
  });

  it("formats negative amounts", () => {
    expect(formatPrice(-500)).toBe("-$5.00");
  });

  it("throws on non-integer cents", () => {
    expect(() => formatPrice(19.99)).toThrow(RangeError);
  });
});

describe("addCents", () => {
  it("sums integer cents", () => {
    expect(addCents(100, 250, 49)).toBe(399);
  });

  it("sums a single amount", () => {
    expect(addCents(1999)).toBe(1999);
  });

  it("sums no amounts to zero", () => {
    expect(addCents()).toBe(0);
  });

  it("handles negative amounts", () => {
    expect(addCents(500, -100)).toBe(400);
  });

  it("throws on non-integer cents", () => {
    expect(() => addCents(0.1, 0.2)).toThrow(RangeError);
  });
});

describe("subtractCents", () => {
  it("subtracts integer cents", () => {
    expect(subtractCents(500, 150)).toBe(350);
  });

  it("can return a negative result", () => {
    expect(subtractCents(100, 500)).toBe(-400);
  });

  it("throws on non-integer cents", () => {
    expect(() => subtractCents(10.5, 1)).toThrow(RangeError);
  });
});

describe("multiplyCents", () => {
  it("multiplies unit price by quantity", () => {
    expect(multiplyCents(1999, 3)).toBe(5997);
  });

  it("multiplies by zero", () => {
    expect(multiplyCents(500, 0)).toBe(0);
  });

  it("throws on a fractional factor", () => {
    expect(() => multiplyCents(100, 1.5)).toThrow(RangeError);
  });

  it("throws on non-integer cents", () => {
    expect(() => multiplyCents(19.99, 2)).toThrow(RangeError);
  });
});
