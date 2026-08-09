import { beforeEach, describe, expect, it } from "vitest";

import {
  clampQuantity,
  decrementQuantity,
  incrementQuantity,
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
  type CartDraft,
} from "@/lib/cart";

const draft = (overrides: Partial<CartDraft> = {}): CartDraft => ({
  productId: "p1",
  name: "Lumina Everyday Tee",
  image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  price: 2499,
  stock: 10,
  ...overrides,
});

describe("useCartStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ lines: [] });
  });

  it("adds a line for a product not already in the cart", () => {
    useCartStore.getState().add(draft({ productId: "p1", quantity: 2 }));
    useCartStore.getState().add(draft({ productId: "p2", name: "Halo Headphones", price: 14900, stock: 30, quantity: 1 }));

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ productId: "p1", quantity: 2, price: 2499, stock: 10 });
  });

  it("merges quantities for a product already in the cart", () => {
    const state = useCartStore.getState();
    state.add(draft({ quantity: 2 }));
    state.add(draft({ quantity: 3 }));

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(5);
  });

  it("clamps a single add to the available stock", () => {
    useCartStore.getState().add(draft({ stock: 5, quantity: 12 }));
    expect(useCartStore.getState().lines[0].quantity).toBe(5);
  });

  it("clamps a merged total to the available stock", () => {
    const state = useCartStore.getState();
    state.add(draft({ stock: 5, quantity: 4 }));
    state.add(draft({ stock: 5, quantity: 3 }));

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(5);
  });

  it("does not add a line when the product is out of stock", () => {
    useCartStore.getState().add(draft({ stock: 0, quantity: 1 }));
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("does not add a line for a zero quantity", () => {
    useCartStore.getState().add(draft({ quantity: 0 }));
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("removes a line by product id", () => {
    const state = useCartStore.getState();
    state.add(draft({ productId: "p1", quantity: 1 }));
    state.add(draft({ productId: "p2", quantity: 1 }));
    state.remove("p1");

    const { lines } = useCartStore.getState();
    expect(lines.map((line) => line.productId)).toEqual(["p2"]);
  });

  it("is a no-op removing a product not in the cart", () => {
    useCartStore.getState().add(draft({ quantity: 1 }));
    useCartStore.getState().remove("missing");

    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("sets a quantity within the stock bounds", () => {
    useCartStore.getState().add(draft({ stock: 8, quantity: 1 }));
    useCartStore.getState().setQuantity("p1", 6);
    expect(useCartStore.getState().lines[0].quantity).toBe(6);
  });

  it("clamps a set quantity to a minimum of 1", () => {
    useCartStore.getState().add(draft({ quantity: 3 }));
    useCartStore.getState().setQuantity("p1", 0);
    expect(useCartStore.getState().lines[0].quantity).toBe(1);
  });

  it("clamps a set quantity to the available stock", () => {
    useCartStore.getState().add(draft({ stock: 4, quantity: 1 }));
    useCartStore.getState().setQuantity("p1", 99);
    expect(useCartStore.getState().lines[0].quantity).toBe(4);
  });

  it("is a no-op setting quantity for a product not in the cart", () => {
    useCartStore.getState().add(draft({ quantity: 1 }));
    useCartStore.getState().setQuantity("missing", 5);
    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("clears all lines", () => {
    const state = useCartStore.getState();
    state.add(draft({ productId: "p1", quantity: 1 }));
    state.add(draft({ productId: "p2", quantity: 2 }));
    state.clear();

    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("persists the cart to localStorage", () => {
    useCartStore.getState().add(draft({ productId: "p1", quantity: 2 }));

    const stored = JSON.parse(localStorage.getItem("lumina-cart") ?? "{}");
    expect(stored.state.lines).toHaveLength(1);
    expect(stored.state.lines[0]).toMatchObject({ productId: "p1", quantity: 2 });
  });

  it("rehydrates persisted lines on a fresh store", async () => {
    localStorage.setItem(
      "lumina-cart",
      JSON.stringify({
        state: {
          lines: [
            {
              productId: "p1",
              name: "Lumina Everyday Tee",
              image: null,
              price: 2499,
              stock: 10,
              quantity: 3,
            },
          ],
        },
        version: 0,
      }),
    );

    await useCartStore.persist.rehydrate();
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ productId: "p1", quantity: 3 });
  });
});

describe("selectors", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ lines: [] });
  });

  it("selectCartCount sums the quantity of every line", () => {
    const state = useCartStore.getState();
    state.add(draft({ productId: "p1", quantity: 2 }));
    state.add(draft({ productId: "p2", price: 14900, stock: 30, quantity: 3 }));

    expect(selectCartCount(useCartStore.getState())).toBe(5);
  });

  it("selectCartCount is zero for an empty cart", () => {
    expect(selectCartCount(useCartStore.getState())).toBe(0);
  });

  it("selectCartSubtotal sums unit price times quantity in integer cents", () => {
    const state = useCartStore.getState();
    state.add(draft({ productId: "p1", price: 2499, quantity: 2 }));
    state.add(draft({ productId: "p2", price: 14900, stock: 30, quantity: 1 }));

    expect(selectCartSubtotal(useCartStore.getState())).toBe(19898);
  });

  it("selectCartSubtotal is zero for an empty cart", () => {
    expect(selectCartSubtotal(useCartStore.getState())).toBe(0);
  });
});

describe("quantity helpers", () => {
  it("clampQuantity bounds a quantity to 1..stock", () => {
    expect(clampQuantity(5, 10)).toBe(5);
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(99, 10)).toBe(10);
  });

  it("clampQuantity yields 0 for zero stock", () => {
    expect(clampQuantity(3, 0)).toBe(0);
  });

  it("incrementQuantity steps up within stock and stops at the bound", () => {
    expect(incrementQuantity(2, 5)).toBe(3);
    expect(incrementQuantity(5, 5)).toBe(5);
  });

  it("decrementQuantity steps down to a minimum of 1", () => {
    expect(decrementQuantity(3)).toBe(2);
    expect(decrementQuantity(1)).toBe(1);
  });
});
