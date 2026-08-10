import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Monitor store health and revenue."
      />
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Revenue KPIs, order counts, and a low-stock alert list will appear here.
        </CardContent>
      </Card>
    </>
  );
}
