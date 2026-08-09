"use client";

import { RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  parseCatalogParams,
  updateCatalogParams,
  type CatalogParamPatch,
} from "@/lib/catalog";
import type { HomeCategory } from "@/lib/data-access";

const DEBOUNCE_MS = 400;

const selectClassName =
  "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface CatalogControlsProps {
  categories: HomeCategory[];
}

export function CatalogControls({ categories }: CatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spec = parseCatalogParams(Object.fromEntries(searchParams));

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setMinPrice(searchParams.get("min_price") ?? "");
    setMaxPrice(searchParams.get("max_price") ?? "");
  }, [searchParams]);

  const navigate = useCallback(
    (patch: CatalogParamPatch) => {
      const next = updateCatalogParams(
        new URLSearchParams(searchParams.toString()),
        patch,
      );
      const query = next.toString();
      if (query === searchParams.toString()) return;
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === (searchParams.get("search") ?? "")) return;
    const timer = setTimeout(() => {
      navigate({ search: trimmed });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, searchParams, navigate]);

  useEffect(() => {
    const trimmed = minPrice.trim();
    if (trimmed === (searchParams.get("min_price") ?? "")) return;
    const timer = setTimeout(() => {
      navigate({ min_price: trimmed });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [minPrice, searchParams, navigate]);

  useEffect(() => {
    const trimmed = maxPrice.trim();
    if (trimmed === (searchParams.get("max_price") ?? "")) return;
    const timer = setTimeout(() => {
      navigate({ max_price: trimmed });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [maxPrice, searchParams, navigate]);

  const hasActiveFilters =
    spec.search !== null ||
    spec.filters.category !== null ||
    spec.filters.minPriceCents !== null ||
    spec.filters.maxPriceCents !== null ||
    spec.filters.inStock ||
    (spec.sort !== "newest" && spec.sort !== "relevance");

  return (
    <div className="mb-8 space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="sm:w-48">
          <Label htmlFor="category" className="sr-only">
            Category
          </Label>
          <select
            id="category"
            value={spec.filters.category ?? ""}
            onChange={(event) =>
              navigate({ category: event.target.value || null })
            }
            className={selectClassName}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="min-price" className="sr-only">
            Minimum price
          </Label>
          <Input
            id="min-price"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min $"
            inputMode="decimal"
            className="w-24"
          />
          <span className="text-muted-foreground" aria-hidden>
            &ndash;
          </span>
          <Label htmlFor="max-price" className="sr-only">
            Maximum price
          </Label>
          <Input
            id="max-price"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max $"
            inputMode="decimal"
            className="w-24"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={spec.filters.inStock}
            onChange={(event) =>
              navigate({ in_stock: event.target.checked ? "true" : null })
            }
            className="size-4 rounded border-input accent-primary"
          />
          In stock
        </label>

        <div className="sm:ml-auto sm:w-48">
          <Label htmlFor="sort" className="sr-only">
            Sort
          </Label>
          <select
            id="sort"
            value={spec.sort}
            onChange={(event) =>
              navigate({
                sort: event.target.value === "relevance" ? null : event.target.value,
              })
            }
            className={selectClassName}
          >
            {spec.sort === "relevance" ? (
              <option value="relevance">Relevance</option>
            ) : null}
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
          >
            <RotateCcw className="size-4" aria-hidden />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
