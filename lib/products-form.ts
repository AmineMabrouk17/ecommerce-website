import { z } from "zod";

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export function slugifyProductName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dollarsToCents(input: string): number | null {
  const normalized = input.trim().replace(/^[$]/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
}

export function centsToDollars(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new RangeError(`cents must be a non-negative integer, got ${cents}`);
  }
  return (cents / 100).toFixed(2);
}

export const productFormSchema = z
  .object({
    productId: z.string().trim().min(1, "Product is required").optional(),
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may only contain lowercase letters, numbers, and hyphens",
      ),
    description: z.string().trim().max(2000, "Description is too long").optional(),
    categoryId: z.string().trim().min(1, "Category is required"),
    priceCents: z
      .number({ message: "Price is required" })
      .int("Price must be a whole number of cents")
      .min(0, "Price must be zero or more"),
    compareAtPriceCents: z
      .number({ message: "Compare-at price must be a number" })
      .int("Compare-at price must be a whole number of cents")
      .min(0, "Compare-at price must be zero or more")
      .nullish(),
    stock: z
      .number({ message: "Stock is required" })
      .int("Stock must be a whole number")
      .min(0, "Stock must be zero or more"),
    images: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Image is required")
          .url("Images must be valid URLs"),
      )
      .max(MAX_PRODUCT_IMAGES, "You can add at most 8 images"),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (
      value.compareAtPriceCents !== null &&
      value.compareAtPriceCents !== undefined &&
      value.compareAtPriceCents <= value.priceCents
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPriceCents"],
        message: "Compare-at price must be greater than the price",
      });
    }
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;

export interface ProductImageFile {
  name: string;
  type: string;
  size: number;
}

export function isAcceptedProductImage(file: ProductImageFile): boolean {
  return (
    file.type.startsWith("image/") &&
    file.size > 0 &&
    file.size <= MAX_PRODUCT_IMAGE_BYTES
  );
}

export function addProductImage(images: string[], image: string): string[] {
  if (images.length >= MAX_PRODUCT_IMAGES) return images;
  return [...images, image];
}

export function removeProductImageAt(images: string[], index: number): string[] {
  if (index < 0 || index >= images.length) return images;
  return [...images.slice(0, index), ...images.slice(index + 1)];
}

export function moveProductImage(images: string[], from: number, to: number): string[] {
  if (from < 0 || from >= images.length || to < 0 || to >= images.length) {
    return images;
  }
  const next = [...images];
  const [image] = next.splice(from, 1);
  next.splice(to, 0, image);
  return next;
}

export function buildProductImagePath(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const rawExtension =
    dot > 0 && dot < fileName.length - 1 ? fileName.slice(dot + 1) : "";
  const extension =
    /^[a-z0-9]{1,10}$/i.test(rawExtension) ? `.${rawExtension.toLowerCase()}` : "";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `products/${id}${extension}`;
}
