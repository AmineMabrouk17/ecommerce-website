import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Review and fulfill customer orders."
      />
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          An order list with line items and shipping details will appear here.
        </CardContent>
      </Card>
    </>
  );
}
