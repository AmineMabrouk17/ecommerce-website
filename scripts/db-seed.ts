import { createClient } from "@supabase/supabase-js";

import {
  DEMO_CUSTOMER,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  validateSeedCatalog,
} from "../lib/seed";

async function main(): Promise<void> {
  validateSeedCatalog();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .upsert(SEED_CATEGORIES, { onConflict: "slug" })
    .select("id, slug");
  if (categoriesError) throw categoriesError;
  const categoryIds = new Map(
    (categories ?? []).map((category) => [category.slug, category.id]),
  );

  const products = SEED_PRODUCTS.map((product) => ({
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compare_at_price: product.compareAtPrice,
    stock: product.stock,
    category_id: categoryIds.get(product.categorySlug),
    images: product.images,
    is_featured: product.isFeatured,
    is_published: product.isPublished,
  }));
  const { data: seeded, error: productsError } = await supabase
    .from("products")
    .upsert(products, { onConflict: "slug" })
    .select("id");
  if (productsError) throw productsError;

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) throw usersError;
  const existing = users.users.find((user) => user.email === DEMO_CUSTOMER.email);

  let demoCustomerState = "already present";
  if (!existing) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: DEMO_CUSTOMER.email,
      password: DEMO_CUSTOMER.password,
      email_confirm: true,
    });
    if (createError) throw createError;
    demoCustomerState = "created";
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: DEMO_CUSTOMER.fullName })
      .eq("id", created.user.id);
    if (profileError) throw profileError;
  } else {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: DEMO_CUSTOMER.fullName })
      .eq("id", existing.id);
    if (profileError) throw profileError;
  }

  const { count: publishedCount, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);
  if (countError) throw countError;

  const { count: searchCount, error: searchError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .textSearch("fts_vector", "jacket or sneaker or headphones or keyboard", {
      type: "websearch",
      config: "english",
    });
  if (searchError) throw searchError;

  console.log(`categories: ${(categories ?? []).length} upserted`);
  console.log(`products: ${(seeded ?? []).length} upserted`);
  console.log(`demo customer (${DEMO_CUSTOMER.email}): ${demoCustomerState}`);
  console.log(`published products: ${publishedCount}`);
  console.log(`full-text search hits for "jacket or sneaker or headphones or keyboard": ${searchCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
