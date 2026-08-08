const defaultCurrency = "USD";

function assertIntegerCents(cents: number, label: string): void {
  if (!Number.isInteger(cents)) {
    throw new RangeError(`${label} must be an integer number of cents, got ${cents}`);
  }
}

export function formatPrice(cents: number, currency: string = defaultCurrency): string {
  assertIntegerCents(cents, "cents");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function addCents(...amounts: number[]): number {
  return amounts.reduce((total, amount) => {
    assertIntegerCents(amount, "amount");
    return total + amount;
  }, 0);
}

export function subtractCents(a: number, b: number): number {
  assertIntegerCents(a, "a");
  assertIntegerCents(b, "b");
  return a - b;
}

export function multiplyCents(cents: number, factor: number): number {
  assertIntegerCents(cents, "cents");
  if (!Number.isInteger(factor)) {
    throw new RangeError(`factor must be an integer, got ${factor}`);
  }
  return cents * factor;
}

export function compareAtSavings(
  priceCents: number,
  compareAtPriceCents: number,
): { savingsCents: number; savingsPercent: number } {
  assertIntegerCents(priceCents, "priceCents");
  assertIntegerCents(compareAtPriceCents, "compareAtPriceCents");
  if (compareAtPriceCents <= priceCents) {
    throw new RangeError(
      `compare-at price must exceed price, got ${compareAtPriceCents} <= ${priceCents}`,
    );
  }
  const savingsCents = compareAtPriceCents - priceCents;
  return {
    savingsCents,
    savingsPercent: Math.round((savingsCents / compareAtPriceCents) * 100),
  };
}
