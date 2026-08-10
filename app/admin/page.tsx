import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { KpiCards } from "@/components/admin/kpi-cards";
import { LowStockTable } from "@/components/admin/low-stock-table";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { getAdminDashboard } from "@/lib/data-access";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const { kpis, lowStockProducts, dailyRevenue } = await getAdminDashboard();

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Monitor store health and revenue."
      />
      <div className="space-y-6">
        <KpiCards kpis={kpis} />
        <LowStockTable products={lowStockProducts} />
        <RevenueChart data={dailyRevenue} />
      </div>
    </>
  );
}
