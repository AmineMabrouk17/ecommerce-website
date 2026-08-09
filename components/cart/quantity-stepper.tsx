"use client";

import { Minus, Plus } from "lucide-react";

import { decrementQuantity, incrementQuantity } from "@/lib/cart";

interface QuantityStepperProps {
  quantity: number;
  stock: number;
  onChange: (quantity: number) => void;
}

export function QuantityStepper({
  quantity,
  stock,
  onChange,
}: QuantityStepperProps) {
  const decrease = () => onChange(decrementQuantity(quantity));
  const increase = () => onChange(incrementQuantity(quantity, stock));

  return (
    <div className="flex items-center rounded-md border">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={quantity <= 1}
        onClick={decrease}
        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="w-10 text-center text-sm font-medium">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={quantity >= stock}
        onClick={increase}
        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
