import { beforeEach, describe, expect, it } from "vitest";

import { useCartDrawerStore } from "@/lib/cart-drawer";

describe("useCartDrawerStore", () => {
  beforeEach(() => {
    useCartDrawerStore.setState({ isOpen: false });
  });

  it("starts closed", () => {
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("open reveals the drawer", () => {
    useCartDrawerStore.getState().open();
    expect(useCartDrawerStore.getState().isOpen).toBe(true);
  });

  it("close hides the drawer", () => {
    useCartDrawerStore.getState().open();
    useCartDrawerStore.getState().close();
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("close is a no-op when already closed", () => {
    useCartDrawerStore.getState().close();
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("toggle flips between closed and open", () => {
    useCartDrawerStore.getState().toggle();
    expect(useCartDrawerStore.getState().isOpen).toBe(true);
    useCartDrawerStore.getState().toggle();
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });
});
