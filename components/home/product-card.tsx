"use client";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCartDrawerStore } from "@/lib/cart-drawer";
import { useCartStore } from "@/lib/cart";
import type { ProductSummary } from "@/lib/data-access";
import { compareAtSavings, formatPrice } from "@/lib/money";

interface ProductCardProps {
  product: ProductSummary;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const add = useCartStore((state) => state.add);
  const openCart = useCartDrawerStore((state) => state.open);
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
    <motion.div
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-soft transition-shadow hover:shadow-lifted"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      whileHover={{ y: -4 }}
    >
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
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
          {product.categoryName ? (
            <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
              {product.categoryName}
            </span>
          ) : null}
          {savings !== null ? (
            <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              -{savings.savingsPercent}%
            </span>
          ) : null}
        </Link>
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-100 transition-all duration-300 sm:translate-y-12 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={handleAdd}
            disabled={soldOut}
          >
            <ShoppingCart className="size-4" aria-hidden />
            {soldOut ? "Sold out" : "Add to cart"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <Link href={`/product/${product.slug}`} className="group/link">
          <h3 className="font-display text-base font-semibold transition-colors group-hover/link:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {compareAtPrice !== null && savings !== null ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
