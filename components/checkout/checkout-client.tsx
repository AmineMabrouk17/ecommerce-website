"use client";

import { useEffect, useState } from "react";

import { CartEmpty } from "@/components/cart/cart-empty";
import {
  CheckoutSuccess,
} from "@/components/checkout/checkout-success";
import {
  OrderSummary,
  type OrderSummaryItem,
} from "@/components/checkout/order-summary";
import {
  PaymentElements,
} from "@/components/checkout/payment-elements";
import {
  ShippingForm,
  type CheckoutPayment,
} from "@/components/checkout/shipping-form";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart";
import type { CheckoutLineError, CheckoutProfile } from "@/lib/data-access";
import { multiplyCents } from "@/lib/money";

interface CheckoutClientProps {
  profile: CheckoutProfile | null;
}

type CheckoutPhase = "shipping" | "payment" | "success";

export function CheckoutClient({ profile }: CheckoutClientProps) {
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<CheckoutPhase>("shipping");
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [lineErrors, setLineErrors] = useState<CheckoutLineError[]>([]);

  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Checkout</h1>
      </main>
    );
  }

  if (phase === "success" && payment) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <CheckoutSuccess orderId={payment.orderId} />
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card>
          <CardContent>
            <CartEmpty />
          </CardContent>
        </Card>
      </main>
    );
  }

  const summaryItems: OrderSummaryItem[] = payment
    ? payment.items
    : lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        quantity: line.quantity,
        lineTotal: multiplyCents(line.price, line.quantity),
      }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-muted-foreground">
          {phase === "shipping"
            ? "Enter your shipping details to continue."
            : "Review your order and pay securely."}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {phase === "shipping" ? (
            <Card>
              <CardContent className="pt-6">
                <ShippingForm
                  profile={profile}
                  lines={lines}
                  onReadyToPay={(next) => {
                    setPayment(next);
                    setPhase("payment");
                  }}
                  onUnavailable={setLineErrors}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                {payment ? (
                  <PaymentElements
                    clientSecret={payment.clientSecret}
                    onSuccess={() => {
                      clear();
                      setPhase("success");
                    }}
                  />
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        <aside>
          <OrderSummary
            items={summaryItems}
            lineErrors={lineErrors}
            totals={
              phase === "payment" && payment
                ? {
                    subtotal: payment.subtotal,
                    shippingAmount: payment.shippingAmount,
                    totalAmount: payment.totalAmount,
                  }
                : null
            }
          />
        </aside>
      </div>
    </main>
  );
}
