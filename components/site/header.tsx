"use client";

import { Moon, ShoppingCart, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useCartDrawerStore } from "@/lib/cart-drawer";
import { selectCartCount, useCartStore } from "@/lib/cart";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted && isDark ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </Button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const count = useCartStore(selectCartCount);
  const openCart = useCartDrawerStore((state) => state.open);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
        >
          {siteConfig.name}
          <span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/catalog">Shop</Link>
          </Button>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            aria-haspopup="dialog"
            onClick={openCart}
            className="relative"
          >
            <ShoppingCart className="size-5" aria-hidden />
            {hydrated && count > 0 ? (
              <span
                aria-hidden
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground"
              >
                {count}
              </span>
            ) : null}
          </Button>
        </nav>
      </div>
    </header>
  );
}
