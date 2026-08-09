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
    <li className="flex gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {line.image ? (
          <Image
            src={line.image}
            alt={line.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{line.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatPrice(line.price)} each
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${line.name} from cart`}
            onClick={onRemove}
            className="text-muted-foreground transition-colors hover:text-destructive"
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
    </li>
  );
}
