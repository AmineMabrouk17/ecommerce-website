"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import type { HomeProduct } from "@/lib/data-access";
import { compareAtSavings, formatPrice } from "@/lib/money";

const MotionLink = motion.create(Link);

interface ProductCardProps {
  product: HomeProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const compareAtPrice = product.compareAtPrice;
  const savings =
    compareAtPrice === null
      ? null
      : compareAtSavings(product.price, compareAtPrice);

  return (
    <MotionLink
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-shadow hover:shadow-lg"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {compareAtPrice !== null && savings !== null ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                Save {savings.savingsPercent}%
              </span>
            </>
          ) : null}
        </div>
      </div>
    </MotionLink>
  );
}
