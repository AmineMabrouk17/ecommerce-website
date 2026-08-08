export const CATALOG_SORTS = ["price_asc", "price_desc", "newest", "trending"] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export type CatalogSortSpec = CatalogSort | "relevance";

export interface CatalogFilters {
  category: string | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  inStock: boolean;
}

export interface CatalogQuerySpec {
  search: string | null;
  filters: CatalogFilters;
  sort: CatalogSortSpec;
  page: number;
  pageSize: number;
  offset: number;
}

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

function asString(value: unknown): string | null {
  const item = Array.isArray(value) ? value[0] : value;
  return typeof item === "string" ? item : null;
}

function asTrimmedString(value: unknown): string | null {
  const raw = asString(value);
  if (raw === null) return null;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : null;
}

function asNonNegativeCents(value: unknown): number | null {
  const raw = asTrimmedString(value);
  if (raw === null) return null;
  const dollars = Number(raw);
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

function asSort(value: unknown): CatalogSort {
  const raw = asString(value);
  if (raw === null) return "newest";
  return (CATALOG_SORTS as readonly string[]).includes(raw)
    ? (raw as CatalogSort)
    : "newest";
}

function asPage(value: unknown): number {
  const raw = asString(value);
  if (raw === null) return 1;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

function asPageSize(value: unknown): number {
  const raw = asString(value);
  if (raw === null) return DEFAULT_PAGE_SIZE;
  const size = Number(raw);
  if (!Number.isInteger(size)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
}

function asBoolean(value: unknown): boolean {
  const raw = asString(value);
  if (raw === null) return false;
  return ["true", "1", "yes"].includes(raw.toLowerCase());
}

export function parseCatalogParams(params: Record<string, unknown>): CatalogQuerySpec {
  const search = asTrimmedString(params.search);
  const explicitSort = asString(params.sort) !== null;
  const sort = search && !explicitSort ? "relevance" : asSort(params.sort);
  const page = asPage(params.page);
  const pageSize = asPageSize(params.page_size);

  return {
    search,
    filters: {
      category: asTrimmedString(params.category),
      minPriceCents: asNonNegativeCents(params.min_price),
      maxPriceCents: asNonNegativeCents(params.max_price),
      inStock: asBoolean(params.in_stock),
    },
    sort,
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}
