import { describe, expect, it } from "vitest";

import {
  buildAdminKpis,
  buildDailyRevenueSeries,
  filterLowStock,
  LOW_STOCK_THRESHOLD,
  type AdminOrderMetric,
} from "@/lib/analytics";

const NOW = new Date(2026, 7, 10, 12, 0, 0); // Aug 10, 2026, local noon

function iso(
  year: number,
  month: number,
  day: number,
  hours = 12,
  minutes = 0,
): string {
  return new Date(year, month, day, hours, minutes).toISOString();
}

function metric(
  status: AdminOrderMetric["status"],
  totalAmount: number,
  createdAt: string,
): AdminOrderMetric {
  return { status, totalAmount, createdAt };
}

describe("buildAdminKpis", () => {
  const paidOrders = [
    metric("paid", 10000, iso(2026, 5, 15)), // Jun 15 — outside 30 days
    metric("paid", 5000, iso(2026, 6, 11, 13)), // Jul 11 — inside 30 days
    metric("paid", 2500, iso(2026, 7, 5)), // Aug 5 — inside 30 days
    metric("paid", 1250, iso(2026, 7, 10, 9)), // Aug 10 — inside 30 days
  ];

  it("sums total revenue across all paid orders", () => {
    expect(buildAdminKpis(paidOrders, NOW).totalRevenue).toBe(18750);
  });

  it("counts revenue from the last 30 days only", () => {
    expect(buildAdminKpis(paidOrders, NOW).revenue30d).toBe(8750);
  });

  it("counts every paid order", () => {
    expect(buildAdminKpis(paidOrders, NOW).orderCount).toBe(4);
  });

  it("counts paid orders in the last 30 days", () => {
    expect(buildAdminKpis(paidOrders, NOW).orderCount30d).toBe(3);
  });

  it("computes the average order value from 30-day figures", () => {
    expect(buildAdminKpis(paidOrders, NOW).averageOrderValue30d).toBe(2917);
  });

  it("excludes non-paid orders from revenue and counts", () => {
    const kpis = buildAdminKpis(
      [
        ...paidOrders,
        metric("pending", 999999, iso(2026, 7, 9)),
        metric("cancelled", 555555, iso(2026, 7, 8)),
      ],
      NOW,
    );
    expect(kpis.totalRevenue).toBe(18750);
    expect(kpis.orderCount).toBe(4);
  });

  it("returns zero average order value when no orders fall in the window", () => {
    const kpis = buildAdminKpis([metric("paid", 10000, iso(2026, 5, 15))], NOW);
    expect(kpis.revenue30d).toBe(0);
    expect(kpis.orderCount30d).toBe(0);
    expect(kpis.averageOrderValue30d).toBe(0);
  });

  it("returns zeros for an empty order list", () => {
    expect(buildAdminKpis([], NOW)).toEqual({
      totalRevenue: 0,
      revenue30d: 0,
      orderCount: 0,
      orderCount30d: 0,
      averageOrderValue30d: 0,
    });
  });

  it("rejects a fractional total amount", () => {
    expect(() =>
      buildAdminKpis([metric("paid", 1000.5, iso(2026, 7, 5))], NOW),
    ).toThrow(RangeError);
  });
});

describe("filterLowStock", () => {
  const products = [
    { id: "a", name: "A", slug: "a", stock: 3, price: 1000, image: null },
    { id: "b", name: "B", slug: "b", stock: 0, price: 2000, image: null },
    { id: "c", name: "C", slug: "c", stock: 8, price: 3000, image: null },
    { id: "d", name: "D", slug: "d", stock: 5, price: 4000, image: null },
  ];

  it("defines the default low-stock threshold as five units", () => {
    expect(LOW_STOCK_THRESHOLD).toBe(5);
  });

  it("keeps only products with stock under the threshold", () => {
    expect(filterLowStock(products).map((product) => product.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("treats stock at the threshold as healthy", () => {
    const low = filterLowStock(products);
    expect(low.some((product) => product.id === "d")).toBe(false);
  });

  it("sorts low-stock products by stock ascending", () => {
    const low = filterLowStock(
      [
        { id: "a", stock: 3 },
        { id: "b", stock: 0 },
        { id: "d", stock: 5 },
      ],
      6,
    );
    expect(low.map((product) => product.stock)).toEqual([0, 3, 5]);
  });

  it("respects a custom threshold", () => {
    expect(filterLowStock(products, 8).map((product) => product.id)).toEqual([
      "b",
      "a",
      "d",
    ]);
  });

  it("returns an empty list when nothing is low", () => {
    expect(filterLowStock([{ id: "c", stock: 8 }])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const copy = products.map((product) => ({ ...product }));
    filterLowStock(products);
    expect(products).toEqual(copy);
  });
});

describe("buildDailyRevenueSeries", () => {
  it("returns one point per day ending today, chronologically", () => {
    const series = buildDailyRevenueSeries([], NOW, 30);
    expect(series).toHaveLength(30);
    expect(series[0].date).toBe("2026-07-12");
    expect(series[29].date).toBe("2026-08-10");
    for (let i = 1; i < series.length; i++) {
      expect(series[i].date > series[i - 1].date).toBe(true);
    }
  });

  it("zero-fills days without paid orders", () => {
    const series = buildDailyRevenueSeries([], NOW, 30);
    expect(series.every((point) => point.revenueCents === 0)).toBe(true);
  });

  it("sums revenue for the calendar day an order was placed", () => {
    const series = buildDailyRevenueSeries(
      [
        metric("paid", 1000, iso(2026, 7, 5, 9)),
        metric("paid", 2000, iso(2026, 7, 5, 18)),
        metric("paid", 500, iso(2026, 7, 5, 23, 59)),
      ],
      NOW,
      30,
    );
    const aug5 = series.find((point) => point.date === "2026-08-05");
    expect(aug5?.revenueCents).toBe(3500);
  });

  it("excludes paid orders outside the 30-day window", () => {
    const series = buildDailyRevenueSeries(
      [metric("paid", 5000, iso(2026, 6, 11, 13))], // Jul 11
      NOW,
      30,
    );
    expect(series.every((point) => point.revenueCents === 0)).toBe(true);
  });

  it("excludes non-paid orders from the daily totals", () => {
    const series = buildDailyRevenueSeries(
      [
        metric("paid", 1000, iso(2026, 7, 5)),
        metric("pending", 9000, iso(2026, 7, 5)),
        metric("cancelled", 8000, iso(2026, 7, 5)),
      ],
      NOW,
      30,
    );
    const aug5 = series.find((point) => point.date === "2026-08-05");
    expect(aug5?.revenueCents).toBe(1000);
  });

  it("rejects a non-positive day count", () => {
    expect(() => buildDailyRevenueSeries([], NOW, 0)).toThrow(RangeError);
    expect(() => buildDailyRevenueSeries([], NOW, -1)).toThrow(RangeError);
    expect(() => buildDailyRevenueSeries([], NOW, 2.5)).toThrow(RangeError);
  });

  it("rejects a fractional total amount", () => {
    expect(() =>
      buildDailyRevenueSeries([metric("paid", 10.5, iso(2026, 7, 5))], NOW, 30),
    ).toThrow(RangeError);
  });
});
