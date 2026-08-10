export interface AdminNavItem {
  href: string;
  label: string;
}

export const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
] as const satisfies readonly AdminNavItem[];

export function activeAdminNavItem(pathname: string): AdminNavItem | null {
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return null;
  }

  let match: AdminNavItem | null = null;
  for (const item of adminNavItems) {
    const underItem =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    if (underItem && (!match || item.href.length > match.href.length)) {
      match = item;
    }
  }
  return match;
}
