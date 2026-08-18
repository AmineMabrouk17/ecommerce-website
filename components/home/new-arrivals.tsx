import Link from "next/link";

import { ProductCard } from "@/components/home/product-card";
import type { HomeProduct } from "@/lib/data-access";

export function NewArrivals({ products }: { products: HomeProduct[] }) {
  return (
    <section id="new-arrivals" className="scroll-mt-6 bg-gradient-to-b from-secondary/40 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              New Arrivals
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              Just dropped
            </h2>
            <p className="mt-1 text-muted-foreground">
              Fresh finds, straight from the workshop.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
