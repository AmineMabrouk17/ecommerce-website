import { describe, expect, it } from "vitest";

import { shippingFormSchema, type ShippingFormInput } from "@/lib/orders";

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
