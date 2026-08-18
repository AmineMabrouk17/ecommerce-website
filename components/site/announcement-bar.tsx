"use client";

import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 text-center text-xs font-medium tracking-wide sm:text-sm">
        <p className="truncate">
          Free shipping on orders over $50 &middot; New arrivals every week{" "}
          <Link href="/catalog" className="ml-1 underline underline-offset-2">
            Shop now
          </Link>
        </p>
      </div>
    </div>
  );
}
