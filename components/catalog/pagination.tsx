import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildPageNumbers,
  serializeCatalogParams,
  updateCatalogParams,
  type CatalogQuerySpec,
  type PaginationInfo,
} from "@/lib/catalog";

interface PaginationProps {
  spec: CatalogQuerySpec;
  pagination: PaginationInfo;
}

export function Pagination({ spec, pagination }: PaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const base = serializeCatalogParams(spec);
  const hrefFor = (pageNumber: number) => {
    const next = updateCatalogParams(new URLSearchParams(base), {
      page: pageNumber === 1 ? null : String(pageNumber),
    });
    const query = next.toString();
    return query ? `?${query}` : "";
  };

  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
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
            href={hrefFor(entry)}
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
          href={hrefFor(page + 1)}
          aria-label="Next page"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
