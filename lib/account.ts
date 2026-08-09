import { z } from "zod";

import type { OrderStatus } from "./orders";

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required"),
  avatarUrl: z
    .string()
    .trim()
    .url("Enter a valid avatar URL")
    .or(z.literal(""))
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? "Unknown";
}

export function orderReference(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
