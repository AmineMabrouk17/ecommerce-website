"use server";

import { revalidatePath } from "next/cache";

import { getAdminAccess } from "@/lib/data-access";
import {
  parseProductToggle,
  type AdminProductToggleInput,
} from "@/lib/products-admin";
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
