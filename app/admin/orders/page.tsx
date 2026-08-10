import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersPagination } from "@/components/admin/orders-pagination";
import { OrdersTable } from "@/components/admin/orders-table";
import { OrdersToolbar } from "@/components/admin/orders-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { buildPagination } from "@/lib/catalog";
import { getAdminOrdersPage } from "@/lib/data-access";
import { parseAdminOrdersParams } from "@/lib/orders-admin";

export const metadata: Metadata = {
  title: "Orders",
};

type AdminOrdersSearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: AdminOrdersSearchParams;
}) {
  const params = parseAdminOrdersParams(searchParams);
  const result = await getAdminOrdersPage(params);
  const pagination = buildPagination({
    totalCount: result.totalCount,
    pageSize: params.pageSize,
    page: params.page,
  });

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Review and fulfill customer orders."
      />
      <OrdersToolbar status={params.status} totalCount={result.totalCount} />
      {result.orders.length > 0 ? (
        <>
          <OrdersTable orders={result.orders} />
          <OrdersPagination status={params.status} pagination={pagination} />
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No orders match your filter.
          </CardContent>
        </Card>
      )}
    </>
  );
}
