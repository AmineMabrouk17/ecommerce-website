import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { HomeCategory } from "@/lib/data-access";

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  return (
    <section id="categories" className="scroll-mt-6">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Shop by category
          </h2>
          <p className="mt-1 text-muted-foreground">
            Explore the collection, organized for easy browsing.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="group flex items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
            >
              <span className="font-medium">{category.name}</span>
              <ArrowUpRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
