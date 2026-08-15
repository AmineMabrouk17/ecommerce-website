import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { HomeCategory } from "@/lib/data-access";

const CATEGORY_TONES: Record<string, string> = {
  apparel: "bg-primary/10 text-primary hover:bg-primary/15",
  footwear: "bg-violet/10 text-violet hover:bg-violet/15",
  accessories: "bg-warning/10 text-warning hover:bg-warning/15",
  "home-living": "bg-success/10 text-success hover:bg-success/15",
  tech: "bg-info/10 text-info hover:bg-info/15",
};

function toneFor(category: HomeCategory): string {
  return CATEGORY_TONES[category.slug] ?? "bg-muted text-muted-foreground hover:bg-accent";
}

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  return (
    <section id="categories" className="scroll-mt-6">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Categories
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
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
              className={cn(
                "group flex items-center justify-between gap-2 rounded-2xl p-5 font-medium shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted",
                toneFor(category),
              )}
            >
              <span>{category.name}</span>
              <ArrowUpRight
                className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
