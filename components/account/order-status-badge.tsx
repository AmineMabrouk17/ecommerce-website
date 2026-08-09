import { cn } from "@/lib/utils";
import { orderStatusLabel } from "@/lib/account";
import type { OrderStatus } from "@/lib/orders";

const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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
