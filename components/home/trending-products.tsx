import { ProductCard } from "@/components/home/product-card";
import type { HomeProduct } from "@/lib/data-access";

export function TrendingProducts({ products }: { products: HomeProduct[] }) {
  return (
    <section id="trending" className="scroll-mt-6">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Trending now</h2>
          <p className="mt-1 text-muted-foreground">
            The most popular picks, ranked by recent orders.
          </p>
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
