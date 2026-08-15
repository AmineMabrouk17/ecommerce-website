"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  decrementQuantity,
  incrementQuantity,
  useCartStore,
} from "@/lib/cart";
import type { ProductDetail } from "@/lib/data-access";
import { compareAtSavings, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

interface ProductPanelProps {
  product: ProductDetail;
}

export function ProductPanel({ product }: ProductPanelProps) {
  const add = useCartStore((state) => state.add);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { stock } = product;
  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;
  const savings =
    product.compareAtPrice === null
      ? null
      : compareAtSavings(product.price, product.compareAtPrice);

  const handleAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      image: product.images[0] ?? null,
      price: product.price,
      stock: product.stock,
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        {product.compareAtPrice !== null && savings !== null ? (
          <>
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="rounded-full bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground">
              Save {savings.savingsPercent}%
            </span>
          </>
        ) : null}
      </div>

      <p
        className={cn(
          "text-sm font-medium",
          outOfStock && "text-destructive",
          lowStock && "text-warning",
          !outOfStock && !lowStock && "text-success",
        )}
      >
        {outOfStock
          ? "Out of stock"
          : lowStock
            ? `Only ${stock} left in stock`
            : "In stock"}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-md border">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={outOfStock || quantity <= 1}
            onClick={() => setQuantity(decrementQuantity(quantity))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="w-12 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={outOfStock || quantity >= stock}
            onClick={() => setQuantity(incrementQuantity(quantity, stock))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button size="lg" onClick={handleAdd} disabled={outOfStock}>
          {added ? "Added to cart" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
