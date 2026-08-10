import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { orderStatusLabel } from "@/lib/account";
import type { OrderStatus } from "@/lib/orders";
import { ADMIN_ORDER_STATUSES } from "@/lib/orders-admin";

const selectClassName =
  "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface OrdersToolbarProps {
  status: OrderStatus | null;
  totalCount: number;
}

export function OrdersToolbar({ status, totalCount }: OrdersToolbarProps) {
  return (
    <div className="mb-6 space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-56">
          <select
            name="status"
            defaultValue={status ?? ""}
            aria-label="Filter by status"
            className={selectClassName}
          >
            <option value="">All statuses</option>
            {ADMIN_ORDER_STATUSES.map((item) => (
              <option key={item} value={item}>
                {orderStatusLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="sm">
          Apply
        </Button>
        {status !== null ? (
          <Button asChild variant="ghost" size="sm">
            <a href="/admin/orders">
              <RotateCcw className="size-4" aria-hidden />
              Clear
            </a>
          </Button>
        ) : null}
      </form>

      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}
