"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { QuantityStepper } from "@/components/cart/quantity-stepper";
import type { CartLine as CartLineModel } from "@/lib/cart";
import { formatPrice, multiplyCents } from "@/lib/money";

interface CartLineProps {
  line: CartLineModel;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLine({ line, onChangeQuantity, onRemove }: CartLineProps) {
  return (
    <div className="group flex gap-4 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
        {line.image ? (
          <Image
            src={line.image}
            alt={line.name}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{line.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatPrice(line.price)} each
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${line.name} from cart`}
            onClick={onRemove}
            className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            quantity={line.quantity}
            stock={line.stock}
            onChange={onChangeQuantity}
          />
          <span className="text-sm font-semibold">
            {formatPrice(multiplyCents(line.price, line.quantity))}
          </span>
        </div>
      </div>
    </div>
  );
}
