export const ADMIN_PRODUCTS_PAGE_SIZE = 10;
export const ADMIN_PRODUCTS_MAX_PAGE_SIZE = 100;

export interface AdminProductsParams {
  search: string | null;
  category: string | null;
  page: number;
  pageSize: number;
  offset: number;
}

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

function asPage(value: unknown): number {
  const raw = asString(value);
  if (raw === null) return 1;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

function asPageSize(value: unknown): number {
  const raw = asString(value);
  if (raw === null) return ADMIN_PRODUCTS_PAGE_SIZE;
  const size = Number(raw);
  if (!Number.isInteger(size)) return ADMIN_PRODUCTS_PAGE_SIZE;
  return Math.min(Math.max(size, 1), ADMIN_PRODUCTS_MAX_PAGE_SIZE);
}

export function parseAdminProductsParams(
  params: Record<string, unknown>,
): AdminProductsParams {
  const page = asPage(params.page);
  const pageSize = asPageSize(params.page_size);
  return {
    search: asTrimmedString(params.search),
    category: asTrimmedString(params.category),
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

export type AdminProductStatus = "published" | "draft";

export function productStatus(isPublished: boolean): AdminProductStatus {
  return isPublished ? "published" : "draft";
}

export function productStatusLabel(isPublished: boolean): string {
  return isPublished ? "Published" : "Draft";
}

export const ADMIN_PRODUCT_TOGGLE_FIELDS = ["is_published", "is_featured"] as const;

export type AdminProductToggleField = (typeof ADMIN_PRODUCT_TOGGLE_FIELDS)[number];

export interface AdminProductToggleInput {
  productId: string;
  field: string;
  value: unknown;
}

export type AdminProductToggleUpdate =
  | { is_published: boolean }
  | { is_featured: boolean };

export type AdminProductToggleResult =
  | { ok: true; update: AdminProductToggleUpdate }
  | { ok: false; error: string };

export function parseProductToggle(
  input: AdminProductToggleInput,
): AdminProductToggleResult {
  if (typeof input.productId !== "string" || input.productId.trim().length === 0) {
    return { ok: false, error: "Product is required." };
  }
  if (typeof input.value !== "boolean") {
    return { ok: false, error: "Toggle value must be a boolean." };
  }
  if (input.field === "is_published") {
    return { ok: true, update: { is_published: input.value } };
  }
  if (input.field === "is_featured") {
    return { ok: true, update: { is_featured: input.value } };
  }
  return { ok: false, error: "Unsupported toggle." };
}
