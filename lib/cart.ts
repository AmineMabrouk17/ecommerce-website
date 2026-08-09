import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { cartSubtotal } from "./pricing";

export interface CartLine {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  stock: number;
  quantity: number;
}

export interface CartDraft {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  stock: number;
  quantity?: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: CartDraft) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export function clampQuantity(quantity: number, stock: number): number {
  if (stock <= 0) return 0;
  return Math.min(Math.max(quantity, 1), stock);
}

export function incrementQuantity(quantity: number, stock: number): number {
  return Math.min(quantity + 1, stock);
}

export function decrementQuantity(quantity: number): number {
  return Math.max(quantity - 1, 1);
}

export function selectCartCount(state: Pick<CartState, "lines">): number {
  return state.lines.reduce((total, line) => total + line.quantity, 0);
}

export function selectCartSubtotal(state: Pick<CartState, "lines">): number {
  return cartSubtotal(state.lines);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product) =>
        set((state) => {
          const requested = product.quantity ?? 1;
          if (requested <= 0) return state;

          const quantity = clampQuantity(requested, product.stock);
          if (quantity === 0) return state;

          const existing = state.lines.find(
            (line) => line.productId === product.productId,
          );
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.productId === product.productId
                  ? {
                      ...line,
                      quantity: clampQuantity(
                        line.quantity + requested,
                        product.stock,
                      ),
                    }
                  : line,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                productId: product.productId,
                name: product.name,
                image: product.image,
                price: product.price,
                stock: product.stock,
                quantity,
              },
            ],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.productId === productId
              ? { ...line, quantity: clampQuantity(quantity, line.stock) }
              : line,
          ),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "lumina-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
