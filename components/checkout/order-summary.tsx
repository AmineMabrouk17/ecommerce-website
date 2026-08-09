"use client";

import { formatPrice } from "@/lib/money";
import type { CheckoutLineError } from "@/lib/data-access";
import { Card, CardContent } from "@/components/ui/card";

export interface OrderSummaryItem {
  productId?: string;
  name: string;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryTotals {
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  lineErrors?: CheckoutLineError[];
  totals?: OrderSummaryTotals | null;
}

export function OrderSummary({
  items,
  lineErrors = [],
  totals = null,
}: OrderSummaryProps) {
  const errorByProduct = new Map(
    lineErrors.map((error) => [error.productId, error.message]),
  );

  return (
    <Card className="sticky top-24">
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="space-y-3">
          {items.map((item) => {
            const lineError = item.productId
              ? errorByProduct.get(item.productId)
              : undefined;
            return (
              <li
                key={`${item.productId ?? item.name}-${item.quantity}`}
                className="text-sm"
              >
                <div
                  className={
                    lineError ? "flex justify-between gap-2 opacity-60" : "flex justify-between gap-2"
                  }
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">× {item.quantity}</span>
                  <span>{formatPrice(item.lineTotal)}</span>
                </div>
                {lineError ? (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {item.name} {lineError}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>

        {lineErrors.length > 0 ? (
          <p className="text-xs text-destructive">
            Some items are unavailable. Remove them from your cart and try again.
          </p>
        ) : null}

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-semibold">
              {totals ? formatPrice(totals.subtotal) : formatPrice(subtotal(items))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {totals
                ? totals.shippingAmount === 0
                  ? "Free"
                  : formatPrice(totals.shippingAmount)
                : "Calculated at checkout"}
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-bold">
              {totals ? formatPrice(totals.totalAmount) : "Calculated at checkout"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function subtotal(items: OrderSummaryItem[]): number {
  return items.reduce((total, item) => total + item.lineTotal, 0);
}
