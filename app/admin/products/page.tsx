import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Create and manage the catalog."
      />
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          A searchable, filterable product table will appear here.
        </CardContent>
      </Card>
    </>
  );
}
