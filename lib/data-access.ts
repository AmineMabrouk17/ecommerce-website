import { buildTrending, type CatalogQuerySpec } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export const TRENDING_LIMIT = 8;
const TRENDING_FETCH_LIMIT = 50;

export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
}

export interface HomeProduct extends ProductSummary {
  createdAt: string;
  unitsOrdered30d: number;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  created_at: string;
}

interface SalesRow {
  product_id: string;
  quantity: number;
}

export interface CatalogPageResult {
  products: ProductSummary[];
  totalCount: number;
}

interface CatalogRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  total_count: number;
}

export async function getCatalogPage(
  spec: CatalogQuerySpec,
): Promise<CatalogPageResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("catalog_products", {
    search_text: spec.search,
    category_slug: spec.filters.category,
    min_price_cents: spec.filters.minPriceCents,
    max_price_cents: spec.filters.maxPriceCents,
    in_stock_only: spec.filters.inStock,
    sort_key: spec.sort,
    page_num: spec.page,
    page_size: spec.pageSize,
  });
  if (error) throw error;

  const rows = (data ?? []) as CatalogRow[];
  return {
    products: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price,
      compareAtPrice: row.compare_at_price,
      image: row.images?.[0] ?? null,
    })),
    totalCount: rows[0]?.total_count ?? 0,
  };
}

export async function getCategories(): Promise<HomeCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

async function fetchLatestPublishedProducts(): Promise<ProductRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, images, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(TRENDING_FETCH_LIMIT);
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

async function fetchUnitsOrdered30d(): Promise<Map<string, number>> {
  const supabase = createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, quantity, orders!inner(status, created_at)")
    .eq("orders.status", "paid")
    .gte("orders.created_at", since);
  if (error) throw error;

  const sales = new Map<string, number>();
  for (const row of (data ?? []) as SalesRow[]) {
    sales.set(row.product_id, (sales.get(row.product_id) ?? 0) + row.quantity);
  }
  return sales;
}

interface TrendingSource {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image: string | null;
  createdAt: string;
}

function toTrendingSource(product: ProductRow): TrendingSource {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compare_at_price: product.compare_at_price,
    image: product.images?.[0] ?? null,
    createdAt: product.created_at,
  };
}

export async function getTrendingProducts(
  limit: number = TRENDING_LIMIT,
): Promise<HomeProduct[]> {
  const [products, sales] = await Promise.all([
    fetchLatestPublishedProducts(),
    fetchUnitsOrdered30d(),
  ]);

  return buildTrending(products.map(toTrendingSource), sales)
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      image: product.image,
      createdAt: product.createdAt,
      unitsOrdered30d: product.unitsOrdered30d,
    }));
}
