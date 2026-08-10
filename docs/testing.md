# Testing: the pure-logic seam

This project follows a single testing seam: framework-free modules own every business rule and are tested in isolation with Vitest. Everything else — server actions, Supabase/Stripe adapters, and React components — stays thin and delegates to this seam.

## Seam modules

| Module | Owns |
| ------ | ---- |
| `lib/money.ts` | formatting and cents arithmetic |
| `lib/pricing.ts` | subtotal, shipping threshold, total |
| `lib/cart.ts` | add/remove/set-quantity transitions, dedupe, quantity bounds |
| `lib/catalog.ts` | URL params → query spec, trending ranking |
| `lib/orders.ts` | order-draft validation, order-transition reducer |
| `lib/orders-admin.ts` | admin orders URL params, admin order-status actions (advance, cancel/refund) |
| `lib/reviews.ts` | eligibility matrix across order statuses |
| `lib/seed.ts` | demo catalog dataset and its validation invariants |
| `lib/route-guard.ts` | redirect decisions for protected routes given auth state |
| `lib/auth.ts` | auth form schemas and safe redirect-destination resolution |
| `lib/account.ts` | profile edit schema, order status labels, order references |

## Rules

- **Pure functions only.** Seam modules have no I/O, no framework imports, and no `this`-dependent state.
- **Test external behavior.** A good test asserts inputs in, state out — never implementation internals.
- **One business rule per location.** If a rule is needed in a component or adapter, move it into a seam module instead of duplicating it.
- **Adapters stay thin.** A thin wrapper that is verified by smoke checks, not unit tests.

## Running tests

- `npm test` — run Vitest in watch mode
- `npm run test:run` — run the suite once (CI)

Tests live in `tests/` and colocate next to the module they cover (e.g. `tests/money.test.ts` covers `lib/money.ts`).
