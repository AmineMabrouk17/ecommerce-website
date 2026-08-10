import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HomeCategory } from "@/lib/data-access";

const selectClassName =
  "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface ProductsToolbarProps {
  categories: HomeCategory[];
  search: string | null;
  category: string | null;
  totalCount: number;
}

export function ProductsToolbar({
  categories,
  search,
  category,
  totalCount,
}: ProductsToolbarProps) {
  const hasFilters = search !== null || category !== null;

  return (
    <div className="mb-6 space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search products"
            aria-label="Search products"
            className="pl-9"
          />
        </div>

        <div className="sm:w-48">
          <select
            name="category"
            defaultValue={category ?? ""}
            aria-label="Filter by category"
            className={selectClassName}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="sm">
          Apply
        </Button>
        {hasFilters ? (
          <Button asChild variant="ghost" size="sm">
            <a href="/admin/products">
              <RotateCcw className="size-4" aria-hidden />
              Clear
            </a>
          </Button>
        ) : null}
      </form>

      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "product" : "products"}
      </p>
    </div>
  );
}
