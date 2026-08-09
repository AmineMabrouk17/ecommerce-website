"use client";

import Link from "next/link";

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
import { formatPrice } from "@/lib/money";

export function CartDrawer() {
  const isOpen = useCartDrawerStore((state) => state.isOpen);
  const open = useCartDrawerStore((state) => state.open);
  const close = useCartDrawerStore((state) => state.close);
  const lines = useCartStore((state) => state.lines);
  const remove = useCartStore((state) => state.remove);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const subtotal = useCartStore(selectCartSubtotal);
  const count = useCartStore(selectCartCount);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(next) => (next ? open() : close())}
    >
      <SheetContent className="flex w-full flex-col gap-6 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            Cart {count > 0 ? `(${count})` : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review the items in your cart
          </SheetDescription>
        </SheetHeader>

        {lines.length > 0 ? (
          <>
            <ul className="flex-1 space-y-6 overflow-y-auto pr-1">
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

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Shipping and total are calculated at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full" onClick={close}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  onClick={close}
                >
                  <Link href="/cart">View cart</Link>
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
