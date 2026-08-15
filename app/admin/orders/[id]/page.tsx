import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, TriangleAlert } from "lucide-react";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderDetailActions } from "@/components/admin/order-detail-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orderReference } from "@/lib/account";
import { getAdminOrder } from "@/lib/data-access";
import { formatPrice, multiplyCents, subtractCents } from "@/lib/money";

export const metadata: Metadata = {
  title: "Order",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getAdminOrder(params.id);
  if (!order) notFound();

  const subtotal = subtractCents(order.totalAmount, order.shippingAmount);

  return (
    <>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      <header className="mb-8 mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Order {orderReference(order.id)}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-muted-foreground">
          Placed by {order.customerName} on {formatOrderDate(order.createdAt)}
        </p>
      </header>

      {order.stockGuardFailed ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Stock guard failed at payment</p>
            <p className="mt-1 text-destructive/90">
              Stock was not fully decremented when this order was paid. Review it
              and refund the customer if needed.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-3 text-sm"
                >
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="size-12 rounded-md border object-cover"
                    />
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {item.productTitle[0]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.productTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(
                      multiplyCents(item.unitPrice, item.quantity),
                    )}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-2 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                Shipping address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <address className="text-sm not-italic leading-relaxed text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {order.customerName}
                  </p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 ? (
                    <p>{order.shippingAddress.line2}</p>
                  ) : null}
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No shipping address recorded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderDetailActions
                orderId={order.id}
                status={order.status}
                totalAmount={order.totalAmount}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function formatOrderDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
