import { cn } from "@/lib/utils";
import { orderStatusLabel } from "@/lib/account";
import type { OrderStatus } from "@/lib/orders";

const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning",
  paid: "bg-info/15 text-info",
  shipped: "bg-violet/15 text-violet",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_TONES[status],
      )}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
