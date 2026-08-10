"use client";

import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { activeAdminNavItem, adminNavItems } from "@/lib/admin";
import { cn } from "@/lib/utils";

const navIcons = {
  "/admin": LayoutDashboard,
  "/admin/products": Package,
  "/admin/orders": ShoppingBag,
} as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const active = activeAdminNavItem(pathname);

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <nav className="flex flex-col gap-1 rounded-xl border bg-card p-2 shadow lg:sticky lg:top-8">
        <p className="px-3 pb-2 pt-1 text-sm font-semibold text-muted-foreground">
          Admin
        </p>
        {adminNavItems.map((item) => {
          const Icon = navIcons[item.href as keyof typeof navIcons];
          const isActive = active?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
