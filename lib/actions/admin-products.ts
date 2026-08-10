"use server";

import { revalidatePath } from "next/cache";

import {
  getAdminAccess,
  getAdminProduct,
  type AdminProductFormData,
} from "@/lib/data-access";
import {
  parseProductToggle,
  type AdminProductToggleInput,
} from "@/lib/products-admin";
import { productFormSchema, type ProductFormInput } from "@/lib/products-form";
import { createClient } from "@/lib/supabase/server";

export interface ToggleProductFieldResult {
  error?: string;
}

export async function toggleProductField(
  input: AdminProductToggleInput,
): Promise<ToggleProductFieldResult> {
  const parsed = parseProductToggle(input);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const { isAuthenticated, isAdmin } = await getAdminAccess();
  if (!isAuthenticated) {
    return { error: "You must be signed in to manage products." };
  }
  if (!isAdmin) {
    return { error: "You do not have permission to manage products." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update(parsed.update)
    .eq("id", input.productId);
  if (error) {
    return { error: "We could not update this product. Please try again." };
  }

  revalidatePath("/admin/products");
  return {};
}

function firstIssueMessage(message: string): string {
  return message || "Something went wrong. Please try again.";
}

export interface SaveProductResult {
  error?: string;
}

export async function saveProduct(
  input: ProductFormInput,
): Promise<SaveProductResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const { isAuthenticated, isAdmin } = await getAdminAccess();
  if (!isAuthenticated) {
    return { error: "You must be signed in to manage products." };
  }
  if (!isAdmin) {
    return { error: "You do not have permission to manage products." };
  }

  const values = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    category_id: parsed.data.categoryId,
    price: parsed.data.priceCents,
    compare_at_price: parsed.data.compareAtPriceCents ?? null,
    stock: parsed.data.stock,
    images: parsed.data.images,
    is_featured: parsed.data.isFeatured,
    is_published: parsed.data.isPublished,
  };

  const supabase = createClient();

  const slugQuery = supabase
    .from("products")
    .select("id")
    .eq("slug", parsed.data.slug);
  if (parsed.data.productId) {
    slugQuery.neq("id", parsed.data.productId);
  }
  const { data: slugOwner } = await slugQuery.maybeSingle();
  if (slugOwner) {
    return { error: "That slug is already in use by another product." };
  }

  let error: { code?: string } | null = null;
  if (parsed.data.productId) {
    const result = await supabase
      .from("products")
      .update(values)
      .eq("id", parsed.data.productId);
    error = result.error;
  } else {
    const result = await supabase.from("products").insert(values);
    error = result.error;
  }

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already in use by another product." };
    }
    return { error: "We could not save this product. Please try again." };
  }

  revalidatePath("/admin/products");
  return {};
}

export interface LoadAdminProductResult {
  product?: AdminProductFormData;
  error?: string;
}

export async function loadAdminProduct(
  productId: string,
): Promise<LoadAdminProductResult> {
  const { isAuthenticated, isAdmin } = await getAdminAccess();
  if (!isAuthenticated) {
    return { error: "You must be signed in to manage products." };
  }
  if (!isAdmin) {
    return { error: "You do not have permission to manage products." };
  }
  if (typeof productId !== "string" || productId.trim().length === 0) {
    return { error: "Product is required." };
  }

  const product = await getAdminProduct(productId);
  if (!product) {
    return { error: "Product not found." };
  }
  return { product };
}
