import { PackageOpen } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orderReference } from "@/lib/account";
import type { AccountOrder } from "@/lib/data-access";
import { formatPrice, multiplyCents } from "@/lib/money";

interface OrderHistoryProps {
  orders: AccountOrder[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order history</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <PackageOpen className="size-10 text-muted-foreground" aria-hidden />
            <p className="font-medium">No orders yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              When you place an order, its status and items will show up here.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/catalog">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Order{" "}
                    <span className="text-muted-foreground">
                      {orderReference(order.id)}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <time
                      dateTime={order.createdAt}
                      className="text-sm text-muted-foreground"
                    >
                      {formatOrderDate(order.createdAt)}
                    </time>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                <ul className="mt-4 divide-y">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3 text-sm"
                    >
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt=""
                          className="size-12 rounded-md border object-cover"
                        />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                          {item.productTitle[0]}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {item.productTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(multiplyCents(item.unitPrice, item.quantity))}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-sm font-semibold">
                    Total{" "}
                    <span className="text-base font-bold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatOrderDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
