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

---

# The browser E2E layer

Alongside the Vitest seam, the project runs a Playwright end-to-end suite against a real browser and a running dev server. Where Vitest proves business rules in isolation, the E2E suite proves the whole stack works together: sign-in, storefront, cart, checkout, account, and admin flows hitting real Supabase (Postgres + Auth) and real Stripe in test mode.

## Scope

| Spec | Covers |
| ---- | ------ |
| `e2e/smoke.spec.ts` | the home page renders with the shop header |
| `e2e/auth-forms.spec.ts` | login, register, forgot-password, and reset-password form validation |
| `e2e/sign-in.spec.ts` | real sign-in, the `?next=` redirect, and signed-in state on `/account` |
| `e2e/storefront.spec.ts` | catalog search/filter/sort, product detail, cart drawer and cart page, route guards |
| `e2e/checkout.spec.ts` | shipping validation, advancing to the payment phase, and the test-card payment to the order-confirmed screen |
| `e2e/account.spec.ts` | profile name update and order history |
| `e2e/admin.spec.ts` | admin dashboard, product create + publish toggle, orders list/detail |

The suite creates real data (orders, a test product, profile edits) in Supabase and Stripe test mode. That is expected; the seed and user scripts are idempotent.

The checkout "test-card payment" test drives Stripe's cross-origin iframes. If Stripe Elements cannot be driven in the current environment it skips itself with a graceful `test.skip` rather than failing the run.

## Run prerequisites

On a fresh machine, in this order:

1. `npm install`
2. `npm run db:seed` — seeds the demo catalog (categories, products) and the demo customer via `scripts/db-seed.ts`. Needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. `npm run db:e2e-users` — ensures the E2E accounts exist and sets their roles via `scripts/create-e2e-users.ts`. Needs the same two env vars; idempotent.
4. `npm run test:e2e:install` — installs the Playwright Chromium browser.

Then either start a dev server (`npm run dev`) or let Playwright boot one. The config's `webServer` reuses an already-running server on `localhost:3000`.

## Scripts

| Command | Behavior |
| ------- | -------- |
| `npm run test:e2e` | runs the full suite in `e2e/` |
| `npm run test:e2e:ui` | opens the interactive Playwright UI |
| `npm run test:e2e:headed` | runs the suite in a visible browser window |
| `npm run test:e2e:install` | installs Chromium for Playwright |

Locally the suite runs headed (`headless: false`); in CI it runs headless. Locally there are no retries and the list reporter is used; in CI (when `CI` is set) tests retry twice and the GitHub reporter is used. See `playwright.config.ts`.

## E2E test accounts

Two fixed accounts are used, managed by `scripts/create-e2e-users.ts`:

| Role | Email | Password |
| ---- | ----- | -------- |
| Customer | `e2e.customer@example.com` | `E2eCustomerPass123!` |
| Admin | `e2e.admin@example.com` | `E2eAdminPass123!` |

Credentials and display names can be overridden with `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`, `E2E_CUSTOMER_NAME`, and the `E2E_ADMIN_*` equivalents. The suite reads them via `e2e/helpers/accounts.ts`, and the provisioning script keeps the Supabase users in sync (creating them if missing, confirming email, and setting the `profiles.role`).
