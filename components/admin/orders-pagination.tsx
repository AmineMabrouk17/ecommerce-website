import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { buildPageNumbers, type PaginationInfo } from "@/lib/catalog";
import type { OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

interface OrdersPaginationProps {
  status: OrderStatus | null;
  pagination: PaginationInfo;
}

function buildHref(status: OrderStatus | null, page: number): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function OrdersPagination({
  status,
  pagination,
}: OrdersPaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-1"
    >
      {page > 1 ? (
        <Link
          href={buildHref(status, page - 1)}
          aria-label="Previous page"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : null}

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            aria-hidden
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={entry}
            href={buildHref(status, entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              entry === page &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {entry}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(status, page + 1)}
          aria-label="Next page"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
