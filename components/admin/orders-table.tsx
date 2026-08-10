import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Button } from "@/components/ui/button";
import { orderReference } from "@/lib/account";
import type { AdminOrderSummary } from "@/lib/data-access";
import { formatPrice } from "@/lib/money";

interface OrdersTableProps {
  orders: AdminOrderSummary[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-center font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-center font-medium">Flag</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 font-medium">
                {orderReference(order.id)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {order.customerName}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatOrderDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 text-center text-muted-foreground">
                {order.itemCount}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatPrice(order.totalAmount)}
              </td>
              <td className="px-4 py-3 text-center">
                {order.stockGuardFailed ? (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium text-destructive"
                    title="Stock was not fully decremented at payment time"
                  >
                    <TriangleAlert className="size-3.5" aria-hidden />
                    Guard
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/orders/${order.id}`}>
                    View
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatOrderDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
