"use client";


import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartDrawerStore } from "@/lib/cart-drawer";
import { useCartStore } from "@/lib/cart";
import type { ProductSummary } from "@/lib/data-access";
import { compareAtSavings, formatPrice } from "@/lib/money";

interface QuickViewModalProps {
  product: ProductSummary;
  open: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  open,
  onClose,
}: QuickViewModalProps) {
  const add = useCartStore((state) => state.add);
  const openCart = useCartDrawerStore((state) => state.open);
  const [quantity, setQuantity] = useState(1);

  const compareAtPrice = product.compareAtPrice;
  const savings =
    compareAtPrice === null
      ? null
      : compareAtSavings(product.price, compareAtPrice);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    for (let i = 0; i < quantity; i++) {
      add({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
        quantity: 1,
      });
    }
    openCart();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative aspect-square bg-muted">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            {savings !== null && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                -{savings.savingsPercent}%
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 p-6">
            {product.categoryName && (
              <span className="w-fit rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
                {product.categoryName}
              </span>
            )}

            <h2 className="font-display text-xl font-semibold">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {compareAtPrice !== null && savings !== null && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {soldOut
                ? "This item is currently out of stock."
                : `${product.stock} in stock`}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-full border">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={soldOut}
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={soldOut}
                >
                  +
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className="w-full"
            >
              <ShoppingCart className="size-4" aria-hidden />
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
