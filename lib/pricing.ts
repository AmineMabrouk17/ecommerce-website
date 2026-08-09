import { addCents, multiplyCents } from "./money";

export const FLAT_SHIPPING_CENTS = 500;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

export interface CartLineInput {
  price: number;
  quantity: number;
}

export function cartSubtotal(lines: CartLineInput[]): number {
  return addCents(
    ...lines.map((line) => multiplyCents(line.price, line.quantity)),
  );
}

export function shippingAmount(subtotalCents: number): number {
  if (addCents(subtotalCents) > FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return FLAT_SHIPPING_CENTS;
}

export function orderTotal(subtotalCents: number): number {
  return addCents(subtotalCents, shippingAmount(subtotalCents));
}
