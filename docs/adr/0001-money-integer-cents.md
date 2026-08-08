# ADR-0001: Money is stored as integer cents

All monetary amounts are stored as integer cents (`INT`) in USD and sent to Stripe unchanged. `NUMERIC`/decimal columns were rejected: they invite floating-point rounding bugs, complicate comparisons and aggregation, and require conversion before every Stripe call. `formatPrice` lives in the `lib/money.ts` seam module and handles display.
