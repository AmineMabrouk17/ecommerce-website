"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm, type Control } from "react-hook-form";

import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  loadAdminProduct,
  saveProduct,
} from "@/lib/actions/admin-products";
import type { HomeCategory } from "@/lib/data-access";
import {
  centsToDollars,
  dollarsToCents,
  productFormSchema,
  slugifyProductName,
  type ProductFormInput,
} from "@/lib/products-form";

const EMPTY_VALUES: ProductFormInput = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  priceCents: 0,
  compareAtPriceCents: null,
  stock: 0,
  images: [],
  isFeatured: false,
  isPublished: false,
};

const selectClassName =
  "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const fieldErrorClassName = "text-sm text-destructive";

interface ProductFormDialogProps {
  categories: HomeCategory[];
  productId?: string;
}

export function ProductFormDialog({
  categories,
  productId,
}: ProductFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugEdited = useRef(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const name = watch("name");
  const slug = watch("slug");
  const images = watch("images");

  useEffect(() => {
    if (!slugEdited.current) {
      const autoSlug = slugifyProductName(name);
      if (autoSlug !== slug) {
        setValue("slug", autoSlug, { shouldValidate: true });
      }
    }
  }, [name, slug, setValue]);

  function openDialog(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;
    setError(null);
    slugEdited.current = false;
    reset(EMPTY_VALUES);
    if (!productId) return;

    startTransition(async () => {
      setLoading(true);
      const result = await loadAdminProduct(productId);
      setLoading(false);
      if (result.error || !result.product) {
        setError(result.error ?? "We could not load this product.");
        return;
      }
      reset({
        productId: result.product.id,
        name: result.product.name,
        slug: result.product.slug,
        description: result.product.description ?? "",
        categoryId: result.product.categoryId,
        priceCents: result.product.priceCents,
        compareAtPriceCents: result.product.compareAtPriceCents,
        stock: result.product.stock,
        images: result.product.images,
        isFeatured: result.product.isFeatured,
        isPublished: result.product.isPublished,
      });
      slugEdited.current = true;
    });
  }

  function onSubmit(values: ProductFormInput) {
    setError(null);
    startTransition(async () => {
      const result = await saveProduct(values);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset(EMPTY_VALUES);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger asChild>
        {productId ? (
          <Button type="button" variant="outline" size="sm">
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
        ) : (
          <Button type="button">
            <Plus className="size-4" aria-hidden />
            New product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>{productId ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>
              {productId
                ? "Update the product details and save your changes."
                : "Add a new product to the catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Lumina Everyday Tee"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className={fieldErrorClassName}>{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="lumina-everyday-tee"
                aria-invalid={Boolean(errors.slug)}
                {...register("slug", {
                  onChange: () => {
                    slugEdited.current = true;
                  },
                })}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from the name; you can edit it.
              </p>
              {errors.slug && (
                <p className={fieldErrorClassName}>{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What should shoppers know?"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              {errors.description && (
                <p className={fieldErrorClassName}>{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                className={selectClassName}
                aria-invalid={Boolean(errors.categoryId)}
                {...register("categoryId")}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className={fieldErrorClassName}>{errors.categoryId.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MoneyField
                control={control}
                name="priceCents"
                label="Price"
                error={errors.priceCents?.message}
              />
              <MoneyField
                control={control}
                name="compareAtPriceCents"
                label="Compare-at price"
                optional
                error={errors.compareAtPriceCents?.message}
              />
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.stock)}
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className={fieldErrorClassName}>{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <ProductImageUpload
                images={images}
                onChange={(next) => setValue("images", next, { shouldValidate: true })}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">
                  Highlight this product in featured sections.
                </p>
              </div>
              <Switch
                checked={watch("isFeatured")}
                onCheckedChange={(checked) =>
                  setValue("isFeatured", checked, { shouldValidate: true })
                }
                aria-label="Featured"
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">
                  Visible to shoppers on the storefront.
                </p>
              </div>
              <Switch
                checked={watch("isPublished")}
                onCheckedChange={(checked) =>
                  setValue("isPublished", checked, { shouldValidate: true })
                }
                aria-label="Published"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || loading}>
              {(pending || loading) && <Loader2 className="size-4 animate-spin" />}
              {productId ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MoneyField({
  control,
  name,
  label,
  optional,
  error,
}: {
  control: Control<ProductFormInput>;
  name: "priceCents" | "compareAtPriceCents";
  label: string;
  optional?: boolean;
  error?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {optional ? " (optional)" : ""}
          </Label>
          <MoneyInput
            id={name}
            value={field.value as number | null}
            onChange={field.onChange}
          />
          {error ? <p className={fieldErrorClassName}>{error}</p> : null}
        </div>
      )}
    />
  );
}

function MoneyInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number | null;
  onChange: (cents: number | null) => void;
}) {
  const [text, setText] = useState(value === null ? "" : centsToDollars(value));

  useEffect(() => {
    setText(value === null ? "" : centsToDollars(value));
  }, [value]);

  return (
    <Input
      id={id}
      inputMode="decimal"
      placeholder="0.00"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        const cents = dollarsToCents(text);
        if (cents !== null) {
          onChange(cents);
        } else {
          setText(value === null ? "" : centsToDollars(value));
        }
      }}
    />
  );
}
