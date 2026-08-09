import { buildTrending, type CatalogQuerySpec } from "@/lib/catalog";
import type { OrderDraftLineInput, OrderStatus } from "@/lib/orders";
import { isReviewableOrderStatus } from "@/lib/reviews";
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

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
  category: { name: string; slug: string } | null;
  createdAt: string;
}

interface ProductDetailRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[] | null;
  created_at: string;
  categories: { name: string; slug: string } | null;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, compare_at_price, stock, images, created_at, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;

  const row = data as ProductDetailRow | null;
  if (row === null) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    images: row.images ?? [],
    category: row.categories,
    createdAt: row.created_at,
  };
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

export interface CheckoutProfile {
  name: string;
  email: string;
}

export async function getCheckoutProfile(): Promise<CheckoutProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    name: profile?.full_name ?? "",
    email: user.email ?? "",
  };
}

export interface CheckoutLineError {
  productId: string;
  message: string;
}

export interface ResolvedCheckoutLines {
  lines: OrderDraftLineInput[];
  errors: CheckoutLineError[];
}

interface CheckoutProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[] | null;
}

export async function resolveCartLines(
  items: { productId: string; quantity: number }[],
): Promise<ResolvedCheckoutLines> {
  if (items.length === 0) {
    return { lines: [], errors: [] };
  }

  const ids = items.map((item) => item.productId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock, images")
    .in("id", ids)
    .eq("is_published", true);
  if (error) throw error;

  const byId = new Map(
    ((data ?? []) as CheckoutProductRow[]).map((row) => [row.id, row]),
  );

  const lines: OrderDraftLineInput[] = [];
  const errors: CheckoutLineError[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      errors.push({ productId: item.productId, message: "is no longer available" });
      continue;
    }
    if (product.stock <= 0) {
      errors.push({ productId: item.productId, message: "is out of stock" });
      continue;
    }
    if (item.quantity > product.stock) {
      errors.push({
        productId: item.productId,
        message: `has only ${product.stock} in stock`,
      });
      continue;
    }

    lines.push({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] ?? null,
      price: product.price,
      quantity: item.quantity,
    });
  }

  return { lines, errors };
}

export interface AccountProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AccountOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productTitle: string;
  productImage: string | null;
  reviewable: boolean;
}

export interface AccountOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAmount: number;
  createdAt: string;
  items: AccountOrderItem[];
}

export interface AccountData {
  profile: AccountProfile | null;
  orders: AccountOrder[];
  reviewedProductIds: string[];
}

interface AccountOrderRow {
  id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_amount: number;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    product_title: string;
    product_image: string | null;
  }[];
}

export async function getAccountData(): Promise<AccountData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { profile: null, orders: [], reviewedProductIds: [] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orderRows, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_amount, shipping_amount, created_at, order_items(id, product_id, quantity, unit_price, product_title, product_image)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("product_id")
    .eq("user_id", user.id);
  if (reviewError) throw reviewError;

  const reviewedProductIds = ((reviewRows ?? []) as { product_id: string }[]).map(
    (review) => review.product_id,
  );

  const orders = ((orderRows ?? []) as AccountOrderRow[]).map((row) => ({
    id: row.id,
    status: row.status,
    totalAmount: row.total_amount,
    shippingAmount: row.shipping_amount,
    createdAt: row.created_at,
    items: row.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      productTitle: item.product_title,
      productImage: item.product_image,
      reviewable: isReviewableOrderStatus(row.status),
    })),
  }));

  return {
    profile: {
      name: profile?.full_name ?? "",
      email: user.email ?? "",
      avatarUrl: profile?.avatar_url ?? null,
    },
    orders,
    reviewedProductIds,
  };
}
