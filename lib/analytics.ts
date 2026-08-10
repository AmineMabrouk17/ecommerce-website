import { addCents } from "./money";
import type { OrderStatus } from "./orders";

const DAY_MS = 24 * 60 * 60 * 1000;

export const LOW_STOCK_THRESHOLD = 5;

export interface AdminOrderMetric {
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface AdminKpis {
  totalRevenue: number;
  revenue30d: number;
  orderCount: number;
  orderCount30d: number;
  averageOrderValue30d: number;
}

export function buildAdminKpis(orders: AdminOrderMetric[], now: Date): AdminKpis {
  const cutoff = now.getTime() - 30 * DAY_MS;
  let totalRevenue = 0;
  let revenue30d = 0;
  let orderCount = 0;
  let orderCount30d = 0;

  for (const order of orders) {
    if (order.status !== "paid") continue;
    totalRevenue = addCents(totalRevenue, order.totalAmount);
    orderCount += 1;
    if (new Date(order.createdAt).getTime() >= cutoff) {
      revenue30d = addCents(revenue30d, order.totalAmount);
      orderCount30d += 1;
    }
  }

  return {
    totalRevenue,
    revenue30d,
    orderCount,
    orderCount30d,
    averageOrderValue30d:
      orderCount30d > 0 ? Math.round(revenue30d / orderCount30d) : 0,
  };
}

export function filterLowStock<T extends { stock: number }>(
  products: readonly T[],
  threshold: number = LOW_STOCK_THRESHOLD,
): T[] {
  if (!Number.isInteger(threshold) || threshold < 1) {
    throw new RangeError(`threshold must be a positive integer, got ${threshold}`);
  }
  return [...products]
    .filter((product) => product.stock < threshold)
    .sort((a, b) => a.stock - b.stock);
}

export interface DailyRevenuePoint {
  date: string;
  revenueCents: number;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDailyRevenueSeries(
  orders: AdminOrderMetric[],
  now: Date,
  days: number = 30,
): DailyRevenuePoint[] {
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError(`days must be a positive integer, got ${days}`);
  }

  const revenueByDay = new Map<string, number>();
  for (const order of orders) {
    if (order.status !== "paid") continue;
    const key = toDateKey(new Date(order.createdAt));
    revenueByDay.set(key, addCents(revenueByDay.get(key) ?? 0, order.totalAmount));
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const points: DailyRevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    const key = toDateKey(day);
    points.push({ date: key, revenueCents: revenueByDay.get(key) ?? 0 });
  }
  return points;
}
