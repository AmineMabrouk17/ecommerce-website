import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsPagination } from "@/components/admin/products-pagination";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductsToolbar } from "@/components/admin/products-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { buildPagination } from "@/lib/catalog";
import { getAdminProductsPage, getCategories } from "@/lib/data-access";
import { parseAdminProductsParams } from "@/lib/products-admin";

export const metadata: Metadata = {
  title: "Products",
};

type AdminProductsSearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: AdminProductsSearchParams;
}) {
  const params = parseAdminProductsParams(searchParams);
  const [categories, result] = await Promise.all([
    getCategories(),
    getAdminProductsPage(params),
  ]);
  const pagination = buildPagination({
    totalCount: result.totalCount,
    pageSize: params.pageSize,
    page: params.page,
  });

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Search the catalog and manage publishing."
      />
      <ProductsToolbar
        categories={categories}
        search={params.search}
        category={params.category}
        totalCount={result.totalCount}
      />
      {result.products.length > 0 ? (
        <>
          <ProductsTable products={result.products} />
          <ProductsPagination
            search={params.search}
            category={params.category}
            pagination={pagination}
          />
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No products match your search.
          </CardContent>
        </Card>
      )}
    </>
  );
}
