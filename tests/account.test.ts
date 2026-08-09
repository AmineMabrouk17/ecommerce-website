import { describe, expect, it } from "vitest";

import {
  orderReference,
  orderStatusLabel,
  profileFormSchema,
  type ProfileFormInput,
} from "@/lib/account";
import type { OrderStatus } from "@/lib/orders";

const validInput: ProfileFormInput = {
  fullName: "Avery Park",
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
};

describe("profileFormSchema", () => {
  it("accepts a valid name and avatar url", () => {
    expect(profileFormSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a name without an avatar", () => {
    expect(
      profileFormSchema.safeParse({ fullName: "Avery Park" }).success,
    ).toBe(true);
  });

  it("trims the name and avatar url", () => {
    const parsed = profileFormSchema.parse({
      fullName: "  Avery Park  ",
      avatarUrl: "  https://example.com/avatar.png  ",
    });
    expect(parsed.fullName).toBe("Avery Park");
    expect(parsed.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("rejects a blank name", () => {
    expect(
      profileFormSchema.safeParse({ fullName: "   " }).success,
    ).toBe(false);
  });

  it("rejects an invalid avatar url", () => {
    expect(
      profileFormSchema.safeParse({
        fullName: "Avery Park",
        avatarUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("treats a blank avatar as absent so it can be cleared", () => {
    const parsed = profileFormSchema.parse({
      fullName: "Avery Park",
      avatarUrl: "",
    });
    expect(parsed.avatarUrl).toBeUndefined();
  });

  it("treats an absent avatar as absent", () => {
    const parsed = profileFormSchema.parse({ fullName: "Avery Park" });
    expect(parsed.avatarUrl).toBeUndefined();
  });
});

describe("orderStatusLabel", () => {
  const statuses: [OrderStatus, string][] = [
    ["pending", "Pending"],
    ["paid", "Paid"],
    ["shipped", "Shipped"],
    ["delivered", "Delivered"],
    ["cancelled", "Cancelled"],
  ];

  it("maps every order status to a display label", () => {
    for (const [status, label] of statuses) {
      expect(orderStatusLabel(status)).toBe(label);
    }
  });

  it("falls back to a neutral label for an unknown status", () => {
    expect(orderStatusLabel("unknown" as OrderStatus)).toBe("Unknown");
  });
});

describe("orderReference", () => {
  it("returns the first eight characters in uppercase", () => {
    expect(orderReference("4f1c9a2b-1234-4e5d-9a0b-000000000000")).toBe(
      "4F1C9A2B",
    );
  });

  it("returns the whole id when it is shorter than eight characters", () => {
    expect(orderReference("ab12")).toBe("AB12");
  });

  it("returns an empty string for an empty id", () => {
    expect(orderReference("")).toBe("");
  });
});
