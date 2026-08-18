"use client";

import { motion } from "framer-motion";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { QuickViewModal } from "@/components/home/quick-view-modal";
import { useCartDrawerStore } from "@/lib/cart-drawer";
import { useCartStore } from "@/lib/cart";
import type { ProductSummary } from "@/lib/data-access";
import { compareAtSavings, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductSummary;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const add = useCartStore((state) => state.add);
  const openCart = useCartDrawerStore((state) => state.open);
  const [wishlisted, setWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const compareAtPrice = product.compareAtPrice;
  const savings =
    compareAtPrice === null
      ? null
      : compareAtSavings(product.price, compareAtPrice);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
      quantity: 1,
    });
    openCart();
  }

  return (
    <>
      <motion.div
        className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-soft transition-shadow hover:shadow-lifted"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
        whileHover={{ y: -4 }}
      >
        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link
            href={`/product/${product.slug}`}
            aria-label={product.name}
            className="absolute inset-0 block"
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : null}
          </Link>

          {/* Category badge */}
          {product.categoryName && (
            <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
              {product.categoryName}
            </span>
          )}

          {/* Discount badge */}
          {savings !== null && (
            <span className="absolute left-3 top-11 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              -{savings.savingsPercent}%
            </span>
          )}

          {/* Top-right action buttons */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full border-background/60 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                setWishlisted((w) => !w);
              }}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn(
                  "size-3.5 transition-colors",
                  wishlisted ? "fill-primary text-primary" : "text-foreground"
                )}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full border-background/60 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              aria-label="Quick view"
            >
              <Eye className="size-3.5 text-foreground" />
            </Button>
          </div>

          {/* Always-visible add to cart overlay on mobile / hover on desktop */}
          <div className="absolute inset-x-3 bottom-3">
            <Button
              type="button"
              size="sm"
              className="w-full shadow-md"
              onClick={handleAdd}
              disabled={soldOut}
            >
              <ShoppingCart className="size-4" aria-hidden />
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
          </div>
        </div>

        {/* Card content */}
        <div className="flex flex-col gap-1.5 p-4">
          <Link href={`/product/${product.slug}`} className="group/link">
            <h3 className="font-display text-base font-semibold transition-colors group-hover/link:text-primary line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {compareAtPrice !== null && savings !== null && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Mobile-visible add to cart button (below content) */}
          <Button
            type="button"
            size="sm"
            className="mt-1 w-full sm:hidden"
            onClick={handleAdd}
            disabled={soldOut}
          >
            <ShoppingCart className="size-4" aria-hidden />
            {soldOut ? "Sold out" : "Add to cart"}
          </Button>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
