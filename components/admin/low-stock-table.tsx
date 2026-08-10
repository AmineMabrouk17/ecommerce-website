import { CheckCircle2, PackageX } from "lucide-react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LowStockProduct } from "@/lib/data-access";
import { formatPrice } from "@/lib/money";

export function LowStockTable({ products }: { products: LowStockProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low stock</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2
              className="size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              All published products are well stocked.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">Stock</th>
                <th className="pb-2 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 rounded-md border object-cover"
                        />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                          {product.name[0]}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        {product.stock === 0 ? (
                          <p className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                            <PackageX className="size-3" aria-hidden />
                            Out of stock
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Reorder soon
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        product.stock === 0
                          ? "font-semibold text-destructive"
                          : "font-semibold"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatPrice(product.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
