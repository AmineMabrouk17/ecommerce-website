import {
  buildAdminKpis,
  buildDailyRevenueSeries,
  filterLowStock,
  LOW_STOCK_THRESHOLD,
  type AdminKpis,
  type DailyRevenuePoint,
} from "@/lib/analytics";
import { buildTrending, type CatalogQuerySpec } from "@/lib/catalog";
import type { OrderDraftLineInput, OrderStatus, ShippingAddress } from "@/lib/orders";
import type { AdminOrdersParams } from "@/lib/orders-admin";
import type { AdminProductsParams } from "@/lib/products-admin";
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
  categoryName: string | null;
  stock: number;
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
  categories: { name: string }[] | null;
  stock: number;
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
  category_name: string | null;
  stock: number;
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
      categoryName: row.category_name ?? null,
      stock: row.stock ?? 9999,
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

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string | null;
  categoryName: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface AdminProductsPageResult {
  products: AdminProductRow[];
  totalCount: number;
}

interface AdminProductRowDb {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  categories: { name: string }[] | null;
}

export async function getAdminProductsPage(
  params: AdminProductsParams,
): Promise<AdminProductsPageResult> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, stock, images, is_published, is_featured, created_at, categories(name)",
      { count: "exact" },
    );

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }
  if (params.category) {
    query = query.eq("categories.slug", params.category);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(params.offset, params.offset + params.pageSize - 1);
  if (error) throw error;

  return {
    products: ((data ?? []) as AdminProductRowDb[]).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price,
      stock: row.stock,
      image: row.images?.[0] ?? null,
      categoryName: row.categories?.[0]?.name ?? null,
      isPublished: row.is_published,
      isFeatured: row.is_featured,
      createdAt: row.created_at,
    })),
    totalCount: count ?? 0,
  };
}

export interface AdminProductFormData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
}

interface AdminProductFormRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[] | null;
  is_featured: boolean;
  is_published: boolean;
}

export async function getAdminProduct(
  id: string,
): Promise<AdminProductFormData | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, category_id, price, compare_at_price, stock, images, is_featured, is_published",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;

  const row = data as AdminProductFormRow | null;
  if (row === null) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.category_id,
    priceCents: row.price,
    compareAtPriceCents: row.compare_at_price,
    stock: row.stock,
    images: row.images ?? [],
    isFeatured: row.is_featured,
    isPublished: row.is_published,
  };
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

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
  verified: boolean;
}

interface ProductReviewRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ProfileNameRow {
  id: string;
  full_name: string | null;
}

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  const supabase = createClient();

  const { data: reviewRows, error } = await supabase
    .from("reviews")
    .select("id, user_id, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (reviewRows ?? []) as unknown as ProductReviewRow[];

  const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    for (const profile of (profileRows ?? []) as ProfileNameRow[]) {
      names.set(profile.id, profile.full_name ?? "");
    }
  }

  const { data: verifiedUserIds } = await supabase.rpc(
    "verified_review_user_ids",
    { product_id: productId },
  );

  const verified = new Set((verifiedUserIds ?? []) as string[]);

  return rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at,
    authorName: names.get(row.user_id) || "Customer",
    verified: verified.has(row.user_id),
  }));
}

async function fetchLatestPublishedProducts(): Promise<ProductRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, images, created_at, stock, categories(name)")
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
  categoryName: string | null;
  stock: number;
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
    categoryName: product.categories?.[0]?.name ?? null,
    stock: product.stock,
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
      categoryName: product.categoryName,
      stock: product.stock,
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

export interface AdminAccess {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { isAuthenticated: false, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isAuthenticated: true,
    isAdmin: profile?.role === "admin",
  };
}

interface ProfileNameRow {
  id: string;
  full_name: string | null;
}

async function fetchProfileNames(userIds: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(userIds));
  const names = new Map<string, string>();
  if (unique.length === 0) return names;

  const supabase = createClient();
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  for (const profile of (profileRows ?? []) as ProfileNameRow[]) {
    names.set(profile.id, profile.full_name ?? "");
  }
  return names;
}

export interface AdminOrderSummary {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAmount: number;
  createdAt: string;
  customerName: string;
  itemCount: number;
  stockGuardFailed: boolean;
}

export interface AdminOrdersPageResult {
  orders: AdminOrderSummary[];
  totalCount: number;
}

interface AdminOrdersPageRow {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_amount: number;
  created_at: string;
  stock_guard_failed: boolean;
  order_items: { id: string }[];
}

export async function getAdminOrdersPage(
  params: AdminOrdersParams,
): Promise<AdminOrdersPageResult> {
  const supabase = createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, user_id, status, total_amount, shipping_amount, created_at, stock_guard_failed, order_items(id)",
      { count: "exact" },
    );
  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(params.offset, params.offset + params.pageSize - 1);
  if (error) throw error;

  const rows = (data ?? []) as AdminOrdersPageRow[];
  const names = await fetchProfileNames(rows.map((row) => row.user_id));

  return {
    orders: rows.map((row) => ({
      id: row.id,
      status: row.status,
      totalAmount: row.total_amount,
      shippingAmount: row.shipping_amount,
      createdAt: row.created_at,
      customerName: names.get(row.user_id) || "Customer",
      itemCount: row.order_items.length,
      stockGuardFailed: row.stock_guard_failed,
    })),
    totalCount: count ?? 0,
  };
}

export interface AdminOrderDetailItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productTitle: string;
  productImage: string | null;
}

export interface AdminOrderDetail {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAmount: number;
  shippingAddress: ShippingAddress | null;
  stripePaymentIntentId: string | null;
  stockGuardFailed: boolean;
  createdAt: string;
  customerName: string;
  items: AdminOrderDetailItem[];
}

interface AdminOrderDetailRow {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_amount: number;
  shipping_address: ShippingAddress | null;
  stripe_payment_intent_id: string | null;
  stock_guard_failed: boolean;
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

export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, total_amount, shipping_amount, shipping_address, stripe_payment_intent_id, stock_guard_failed, created_at, order_items(id, product_id, quantity, unit_price, product_title, product_image)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;

  const row = data as AdminOrderDetailRow | null;
  if (row === null) return null;

  const names = await fetchProfileNames([row.user_id]);

  return {
    id: row.id,
    status: row.status,
    totalAmount: row.total_amount,
    shippingAmount: row.shipping_amount,
    shippingAddress: row.shipping_address,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    stockGuardFailed: row.stock_guard_failed,
    createdAt: row.created_at,
    customerName: names.get(row.user_id) || "Customer",
    items: row.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      productTitle: item.product_title,
      productImage: item.product_image,
    })),
  };
}

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
  image: string | null;
}

export interface AdminDashboardData {
  kpis: AdminKpis;
  lowStockProducts: LowStockProduct[];
  dailyRevenue: DailyRevenuePoint[];
}

interface AdminOrderRow {
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

interface LowStockProductRow {
  id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
  images: string[] | null;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = createClient();
  const [orderResult, productResult] = await Promise.all([
    supabase
      .from("orders")
      .select("status, total_amount, created_at")
      .eq("status", "paid"),
    supabase
      .from("products")
      .select("id, name, slug, stock, price, images")
      .eq("is_published", true)
      .lt("stock", LOW_STOCK_THRESHOLD),
  ]);
  if (orderResult.error) throw orderResult.error;
  if (productResult.error) throw productResult.error;

  const orders = ((orderResult.data ?? []) as AdminOrderRow[]).map((row) => ({
    status: row.status,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
  }));

  const now = new Date();
  const lowStockProducts = filterLowStock(
    ((productResult.data ?? []) as LowStockProductRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      stock: row.stock,
      price: row.price,
      image: row.images?.[0] ?? null,
    })),
  );

  return {
    kpis: buildAdminKpis(orders, now),
    lowStockProducts,
    dailyRevenue: buildDailyRevenueSeries(orders, now),
  };
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
