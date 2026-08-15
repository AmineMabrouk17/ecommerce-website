import Image from "next/image";

import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { ProductToggle } from "@/components/admin/product-toggle";
import type { AdminProductRow, HomeCategory } from "@/lib/data-access";
import { formatPrice } from "@/lib/money";
import {
  productStatus,
  productStatusLabel,
} from "@/lib/products-admin";
import { cn } from "@/lib/utils";

interface ProductsTableProps {
  products: AdminProductRow[];
  categories: HomeCategory[];
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        productStatus(isPublished) === "published"
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground",
      )}
    >
      {productStatusLabel(isPublished)}
    </span>
  );
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Published</th>
            <th className="px-4 py-3 text-center font-medium">Featured</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 shrink-0 rounded-md border object-cover"
                    />
                  ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {product.name[0]}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="max-w-56 truncate font-medium">{product.name}</p>
                    <p className="max-w-56 truncate text-xs text-muted-foreground">
                      {product.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {product.categoryName ?? "\u2014"}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatPrice(product.price)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right",
                  product.stock === 0 && "font-semibold text-destructive",
                )}
              >
                {product.stock}
              </td>
              <td className="px-4 py-3">
                <StatusBadge isPublished={product.isPublished} />
              </td>
              <td className="px-4 py-3 text-center">
                <ProductToggle
                  productId={product.id}
                  field="is_published"
                  checked={product.isPublished}
                  label={`Toggle published status for ${product.name}`}
                />
              </td>
              <td className="px-4 py-3 text-center">
                <ProductToggle
                  productId={product.id}
                  field="is_featured"
                  checked={product.isFeatured}
                  label={`Toggle featured status for ${product.name}`}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <ProductFormDialog
                  categories={categories}
                  productId={product.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
