import type { Metadata } from "next";

import { EmptyState } from "@/components/catalog/empty-state";
import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid } from "@/components/catalog/product-grid";
import { siteConfig } from "@/config/site";
import { buildPagination, parseCatalogParams } from "@/lib/catalog";
import { getCatalogPage } from "@/lib/data-access";

export const metadata: Metadata = {
  title: "Shop all",
  description: `Browse and search the full ${siteConfig.name} catalog.`,
};

type CatalogSearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const spec = parseCatalogParams(searchParams);
  const result = await getCatalogPage(spec);
  const pagination = buildPagination({
    totalCount: result.totalCount,
    pageSize: spec.pageSize,
    page: spec.page,
  });

  const heading = spec.search
    ? `Search results for "${spec.search}"`
    : "Shop all";

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        <p className="mt-1 text-muted-foreground">
          {result.totalCount} {result.totalCount === 1 ? "product" : "products"}
        </p>
      </header>

      {result.products.length > 0 ? (
        <>
          <ProductGrid products={result.products} />
          <Pagination spec={spec} pagination={pagination} />
        </>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
