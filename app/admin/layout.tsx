import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { siteConfig } from "@/config/site";
import { getAdminAccess } from "@/lib/data-access";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: `%s · Admin`,
  },
  description: `Manage ${siteConfig.name} products and fulfill orders.`,
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isAdmin } = await getAdminAccess();
  if (!isAuthenticated) {
    redirect("/login");
  }
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
