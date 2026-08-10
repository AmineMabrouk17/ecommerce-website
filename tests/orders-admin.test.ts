import { describe, expect, it } from "vitest";

import {
  ADMIN_ORDERS_PAGE_SIZE,
  parseAdminOrdersParams,
  reduceAdminOrderAction,
  type AdminOrderSnapshot,
} from "@/lib/orders-admin";

describe("parseAdminOrdersParams", () => {
  it("defaults to no status filter and the first page", () => {
    expect(parseAdminOrdersParams({})).toEqual({
      status: null,
      page: 1,
      pageSize: ADMIN_ORDERS_PAGE_SIZE,
      offset: 0,
    });
  });

  it("reads a valid status filter", () => {
    for (const status of ["pending", "paid", "shipped", "delivered", "cancelled"]) {
      expect(parseAdminOrdersParams({ status }).status).toBe(status);
    }
  });

  it("trims the status filter", () => {
    expect(parseAdminOrdersParams({ status: "  paid  " }).status).toBe("paid");
  });

  it("ignores an invalid status filter", () => {
    for (const status of ["refunded", "open", " "]) {
      expect(parseAdminOrdersParams({ status }).status).toBeNull();
    }
  });

  it("clamps page to a positive integer", () => {
    expect(parseAdminOrdersParams({ page: "3" }).page).toBe(3);
    expect(parseAdminOrdersParams({ page: "0" }).page).toBe(1);
    expect(parseAdminOrdersParams({ page: "-2" }).page).toBe(1);
    expect(parseAdminOrdersParams({ page: "nope" }).page).toBe(1);
    expect(parseAdminOrdersParams({ page: "1.5" }).page).toBe(1);
  });

  it("clamps page size to a positive integer within bounds", () => {
    expect(parseAdminOrdersParams({ page_size: "25" }).pageSize).toBe(25);
    expect(parseAdminOrdersParams({ page_size: "0" }).pageSize).toBe(1);
    expect(parseAdminOrdersParams({ page_size: "500" }).pageSize).toBe(100);
    expect(parseAdminOrdersParams({ page_size: "nope" }).pageSize).toBe(
      ADMIN_ORDERS_PAGE_SIZE,
    );
  });

  it("derives the offset from page and page size", () => {
    expect(parseAdminOrdersParams({ page: "4" }).offset).toBe(30);
    expect(
      parseAdminOrdersParams({ page: "2", page_size: "50" }).offset,
    ).toBe(50);
  });
});

describe("reduceAdminOrderAction", () => {
  const paidOrder: AdminOrderSnapshot = {
    status: "paid",
    totalAmount: 2499,
    items: [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ],
  };

  describe("advance", () => {
    it("advances a paid order to shipped", () => {
      const transition = reduceAdminOrderAction(paidOrder, { kind: "advance" });

      expect(transition.noOp).toBe(false);
      expect(transition.status).toBe("shipped");
      expect(transition.effects).toEqual([]);
    });

    it("advances a shipped order to delivered", () => {
      const transition = reduceAdminOrderAction(
        { ...paidOrder, status: "shipped" },
        { kind: "advance" },
      );

      expect(transition.noOp).toBe(false);
      expect(transition.status).toBe("delivered");
      expect(transition.effects).toEqual([]);
    });

    it("does not advance a pending order", () => {
      const transition = reduceAdminOrderAction(
        { ...paidOrder, status: "pending" },
        { kind: "advance" },
      );

      expect(transition.noOp).toBe(true);
      expect(transition.status).toBe("pending");
      expect(transition.effects).toEqual([]);
    });

    it("does not advance delivered or cancelled orders", () => {
      for (const status of ["delivered", "cancelled"] as const) {
        const transition = reduceAdminOrderAction(
          { ...paidOrder, status },
          { kind: "advance" },
        );

        expect(transition.noOp).toBe(true);
        expect(transition.status).toBe(status);
        expect(transition.effects).toEqual([]);
      }
    });
  });

  describe("cancel", () => {
    it("cancels a pending order with no refund or stock effects", () => {
      const transition = reduceAdminOrderAction(
        { ...paidOrder, status: "pending" },
        { kind: "cancel" },
      );

      expect(transition.noOp).toBe(false);
      expect(transition.status).toBe("cancelled");
      expect(transition.effects).toEqual([]);
    });

    it("cancels a paid order with a refund effect for its total", () => {
      const transition = reduceAdminOrderAction(paidOrder, { kind: "cancel" });

      expect(transition.noOp).toBe(false);
      expect(transition.status).toBe("cancelled");
      expect(transition.effects[0]).toEqual({
        kind: "refund",
        amount: 2499,
      });
    });

    it("restores stock for each order item when cancelling a paid order", () => {
      const transition = reduceAdminOrderAction(paidOrder, { kind: "cancel" });

      expect(transition.effects).toEqual([
        { kind: "refund", amount: 2499 },
        { kind: "restore", productId: "p1", quantity: 2 },
        { kind: "restore", productId: "p2", quantity: 1 },
      ]);
    });

    it("does not cancel shipped or delivered orders", () => {
      for (const status of ["shipped", "delivered"] as const) {
        const transition = reduceAdminOrderAction(
          { ...paidOrder, status },
          { kind: "cancel" },
        );

        expect(transition.noOp).toBe(true);
        expect(transition.status).toBe(status);
        expect(transition.effects).toEqual([]);
      }
    });

    it("does not cancel an already cancelled order", () => {
      const transition = reduceAdminOrderAction(
        { ...paidOrder, status: "cancelled" },
        { kind: "cancel" },
      );

      expect(transition.noOp).toBe(true);
      expect(transition.status).toBe("cancelled");
      expect(transition.effects).toEqual([]);
    });
  });
});
