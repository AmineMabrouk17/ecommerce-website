"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Truck, ShoppingBag } from "lucide-react";

import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLine } from "@/components/cart/cart-line";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartDrawerStore } from "@/lib/cart-drawer";
import {
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/money";

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartDrawer() {
  const isOpen = useCartDrawerStore((state) => state.isOpen);
  const open = useCartDrawerStore((state) => state.open);
  const close = useCartDrawerStore((state) => state.close);
  const lines = useCartStore((state) => state.lines);
  const remove = useCartStore((state) => state.remove);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const subtotal = useCartStore(selectCartSubtotal);
  const count = useCartStore(selectCartCount);

  const shippingProgress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const freeShippingReached = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <ShoppingBag className="size-5" aria-hidden />
            Cart {count > 0 && <span className="text-muted-foreground font-normal">({count} {count === 1 ? "item" : "items"})</span>}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review the items in your cart
          </SheetDescription>
        </SheetHeader>

        {lines.length > 0 ? (
          <>
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 text-xs">
                <Truck className={cn("size-4", freeShippingReached ? "text-green-600" : "text-muted-foreground")} aria-hidden />
                {freeShippingReached ? (
                  <span className="font-medium text-green-600">You&apos;ve unlocked free shipping!</span>
                ) : (
                  <span className="text-muted-foreground">
                    Add <span className="font-medium text-foreground">{formatPrice(remaining)}</span> more for free shipping
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    freeShippingReached ? "bg-green-600" : "bg-primary"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            <ul className="flex-1 space-y-0 overflow-y-auto px-6 py-4">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.productId}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartLine
                      line={line}
                      onChangeQuantity={(quantity) =>
                        setQuantity(line.productId, quantity)
                      }
                      onRemove={() => remove(line.productId)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-t bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full rounded-full" onClick={close}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={close}
                >
                  <Link href="/cart">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CartEmpty />
        )}
      </SheetContent>
    </Sheet>
  );
}
