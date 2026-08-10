import type { OrderLine, OrderStatus } from "./orders";

export const ADMIN_ORDERS_PAGE_SIZE = 10;
export const ADMIN_ORDERS_MAX_PAGE_SIZE = 100;

export const ADMIN_ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export interface AdminOrdersParams {
  status: OrderStatus | null;
  page: number;
  pageSize: number;
  offset: number;
}

function asString(value: unknown): string | null {
  const item = Array.isArray(value) ? value[0] : value;
  return typeof item === "string" ? item : null;
}

function asStatus(value: unknown): OrderStatus | null {
  const raw = asString(value);
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!(ADMIN_ORDER_STATUSES as readonly string[]).includes(trimmed)) {
    return null;
  }
  return trimmed as OrderStatus;
}

function asPage(value: unknown): number {
  const raw = asString(value);
  if (raw === null) return 1;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

function asPageSize(value: unknown): number {
  const raw = asString(value);
  if (raw === null) return ADMIN_ORDERS_PAGE_SIZE;
  const size = Number(raw);
  if (!Number.isInteger(size)) return ADMIN_ORDERS_PAGE_SIZE;
  return Math.min(Math.max(size, 1), ADMIN_ORDERS_MAX_PAGE_SIZE);
}

export function parseAdminOrdersParams(
  params: Record<string, unknown>,
): AdminOrdersParams {
  const page = asPage(params.page);
  const pageSize = asPageSize(params.page_size);
  return {
    status: asStatus(params.status),
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

export type AdminOrderAction = { kind: "advance" } | { kind: "cancel" };

export type AdminOrderEffect =
  | { kind: "refund"; amount: number }
  | { kind: "restore"; productId: string; quantity: number };

export interface AdminOrderSnapshot {
  status: OrderStatus;
  totalAmount: number;
  items: OrderLine[];
}

export interface AdminOrderTransition {
  status: OrderStatus;
  effects: AdminOrderEffect[];
  noOp: boolean;
}

function restoreEffects(order: AdminOrderSnapshot): AdminOrderEffect[] {
  return order.items.map((item) => ({
    kind: "restore" as const,
    productId: item.productId,
    quantity: item.quantity,
  }));
}

export function reduceAdminOrderAction(
  order: AdminOrderSnapshot,
  action: AdminOrderAction,
): AdminOrderTransition {
  if (action.kind === "advance") {
    if (order.status === "paid") {
      return { status: "shipped", effects: [], noOp: false };
    }
    if (order.status === "shipped") {
      return { status: "delivered", effects: [], noOp: false };
    }
    return { status: order.status, effects: [], noOp: true };
  }

  if (order.status === "pending") {
    return { status: "cancelled", effects: [], noOp: false };
  }
  if (order.status === "paid") {
    return {
      status: "cancelled",
      effects: [
        { kind: "refund", amount: order.totalAmount },
        ...restoreEffects(order),
      ],
      noOp: false,
    };
  }
  return { status: order.status, effects: [], noOp: true };
}
