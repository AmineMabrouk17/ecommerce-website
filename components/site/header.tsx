"use client";

import {
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { useCartDrawerStore } from "@/lib/cart-drawer";
import { selectCartCount, useCartStore } from "@/lib/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/catalog?sort=popular", label: "Popular" },
  { href: "/catalog", label: "Shop" },
];

function ThemeToggle({ className }: { className?: string }) {
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
      className={className}
    >
      {mounted && isDark ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </Button>
  );
}

function CartButton({ className }: { className?: string }) {
  const count = useCartStore(selectCartCount);
  const openCart = useCartDrawerStore((state) => state.open);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Open cart"
      aria-haspopup="dialog"
      onClick={openCart}
      className={cn("relative", className)}
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
  );
}

function MobileNav() {
  const count = useCartStore(selectCartCount);
  const openCart = useCartDrawerStore((state) => state.open);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <SheetContent side="left" className="w-full max-w-sm p-0">
      <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight"
          >
            {siteConfig.name}
            <span className="text-primary">.</span>
          </Link>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Close menu">
              <X className="size-5" aria-hidden />
            </Button>
          </SheetClose>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {navLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="border-t px-6 py-4">
          <div className="flex flex-col gap-2">
            <SheetClose asChild>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <User className="size-4" aria-hidden />
                Sign In
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Create Account
              </Link>
            </SheetClose>
            <div className="flex items-center gap-2 pt-2">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="relative justify-start gap-2"
                  onClick={() => {
                    openCart();
                  }}
                >
                  <ShoppingCart className="size-4" aria-hidden />
                  Cart
                  {hydrated && count > 0 ? (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                      {count}
                    </span>
                  ) : null}
                </Button>
              </SheetClose>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="lg:hidden"
                >
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <MobileNav />
            </Sheet>
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight"
            >
              {siteConfig.name}
              <span className="text-primary">.</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href))
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <Link href="/sign-in">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Sign in"
                className="hidden sm:inline-flex"
              >
                <User className="size-5" aria-hidden />
              </Button>
            </Link>
            <ThemeToggle className="hidden sm:inline-flex" />
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}
