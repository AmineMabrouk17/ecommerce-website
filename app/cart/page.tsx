"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLine } from "@/components/cart/cart-line";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart";
import { formatPrice } from "@/lib/money";

export default function CartPage() {
  const [hydrated, setHydrated] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const remove = useCartStore((state) => state.remove);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const subtotal = useCartStore(selectCartSubtotal);
  const count = useCartStore(selectCartCount);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
        <p className="mt-1 text-muted-foreground">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </header>

      {lines.length === 0 ? (
        <Card>
          <CardContent>
            <CartEmpty />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-6">
            {lines.map((line) => (
              <CartLine
                key={line.productId}
                line={line}
                onChangeQuantity={(quantity) =>
                  setQuantity(line.productId, quantity)
                }
                onRemove={() => remove(line.productId)}
              />
            ))}
          </ul>

          <aside>
            <Card className="sticky top-24">
              <CardContent className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Order summary</h2>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and total are calculated at checkout.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/catalog">Continue shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </main>
  );
}
