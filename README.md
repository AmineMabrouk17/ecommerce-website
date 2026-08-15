# E-commerce Engine

> A full-stack, single-context online storefront: browse, buy, and run your store — all in one system.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)

<p align="center">
  <a href="https://github.com/AmineMabrouk17/ecommerce-website">
    <img src="https://img.shields.io/badge/Explore%20the%20Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="Explore the repository" />
  </a>
</p>

---

## Overview

**E-commerce Engine** is a custom-built online store: a server-rendered **Next.js** storefront backed by **Supabase** (Postgres, Auth, Storage) with **Stripe** payments. Catalog, cart, checkout, and fulfillment are one unified system — no external e-commerce platform required.

Every dollar is treated as **integer cents in USD** (never floats), every product is a **single SKU** with one price and one stock count, and orders move through a strict lifecycle from *pending* to *paid* to *shipped* to *delivered*. This keeps the domain model simple, predictable, and testable end to end.

Built for store owners and developers who want full control: a fast shopper-facing storefront **and** a complete admin console for managing the catalog, monitoring analytics, and fulfilling orders — with a 19-file Vitest suite guarding the business logic.

## Features

### Storefront & UI/UX
- **Home page** with featured/trending products and a polished, animated layout (Framer Motion).
- **Catalog page** with server-rendered controls for search, filtering, sorting, and pagination.
- **Product detail pages** with image gallery, pricing, stock status, and verified-purchase reviews.
- **Cart drawer** with quantity steppers, persisted locally, and a dedicated cart page.
- **Responsive, accessible components** built on Tailwind CSS, Radix UI, and shadcn/ui conventions.

### Core commerce functionality
- **Checkout flow** that turns the cart into an order: shipping form, Stripe Payment Elements, and an order summary with a free-shipping threshold.
- **Order lifecycle** (pending → paid → shipped → delivered → cancelled) with server actions and admin fulfillment controls.
- **Reviews** — verified-purchase ratings and comments, publicly readable, tied to real orders.
- **Accounts** — email/password **and** OAuth sign-in, profile editing, and order history.

### Data handling & architecture
- **Money module** — all amounts stored and computed as integer cents; display-only dollar conversion.
- **Order snapshots** — order items snapshot product title/image at purchase time so history never drifts.
- **Atomic inventory guard** — stock decrements only on `payment_intent.succeeded`, bounded to a single concurrent unit to prevent overselling.
- **Soft-delete catalog** — unpublished products vanish from the storefront while orders and reviews survive.
- **DB seed script** (`npm run db:seed`) to bootstrap a realistic catalog.
- **Pure-logic modules** extracted and tested in isolation (pricing, money, order transitions, cart, catalog parsing).

### Admin console
- **Analytics dashboard** with revenue charts (Recharts), KPI cards, and a low-stock table.
- **Product management** — create, edit, soft-delete, publish toggle, and image upload to Supabase Storage.
- **Order management** — filterable, paginated order list, order detail with advance/cancel actions, and stock restore on refund.

### API & integrations
- **Stripe webhook** endpoint for payment confirmation and stock handling.
- **Supabase Auth** with SSR helpers, middleware route guards, and password reset flow.
- **Server actions** for all mutations with Zod-validated forms (React Hook Form).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, Lucide Icons |
| State | Zustand (cart), React Hook Form + Zod (forms) |
| Backend / Data | Supabase (Postgres, Auth, Storage) |
| Payments | Stripe Checkout & Webhooks |
| Charts | Recharts |
| Testing | Vitest, Testing Library, jsdom |

## Getting Started

### Prerequisites

- Node.js 18.17+
- A Supabase project (Postgres, Auth, Storage)
- A Stripe account

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/AmineMabrouk17/ecommerce-website.git
   cd ecommerce-website
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

   Then fill in your Supabase URL/key, Stripe keys, and webhook secret. See `.env.local.example` for the full list.

3. Apply the database migrations (in `supabase/migrations/`) to your Supabase project.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Common scripts

```bash
npm run dev        # start the development server
npm run build      # production build
npm run start      # run the production build
npm run lint       # lint the codebase
npm run typecheck  # type-check with tsc
npm run test:run   # run the Vitest suite once
npm run db:seed    # seed the catalog (requires .env.local)
```

## Project Structure

```
app/          # Next.js App Router pages (storefront, auth, admin, API routes)
components/   # Reusable UI + feature components (catalog, cart, checkout, admin)
lib/          # Business logic, server actions, and Supabase/Stripe clients
supabase/     # Database migrations
tests/        # Vitest test suite
docs/         # Architecture decision records (ADR) and agent docs
```

## Roadmap & Suggested Issues

Feature ideas and improvements that would make great follow-up tickets:

| Priority | Area | Suggestion |
| --- | --- | --- |
| High | Payments | Add order confirmation emails (transactional email service) |
| High | Catalog | Product variants / multiple SKUs per product (extends ADR-0002) |
| High | Catalog | Full-text product search across title, description, and category |
| Medium | Storefront | Wishlist / saved-for-later with a dedicated page |
| Medium | Pricing | Discount codes and percentage/fixed promo coupons |
| Medium | Checkout | Multi-currency or localized pricing support |
| Medium | Admin | Review moderation queue (approve / hide reviews) |
| Medium | Orders | Shipping address selection and saved addresses on account |
| Low | UX | Dark mode theme toggle |
| Low | i18n | Internationalization for storefront and admin |
| Low | SEO | Sitemap generation and richer metadata / Open Graph tags |
| Low | Admin | CSV import/export for products and orders |

## Documentation

- **Domain model & language** — see [`CONTEXT.md`](./CONTEXT.md) for the ubiquitous language (money, product, order lifecycle, etc.).
- **Architecture decisions** — see [`docs/adr/`](./docs/adr/) for records on money-as-integer-cents, single-SKU products, inventory-on-payment, flat shipping, and soft-delete.
- **Testing** — see [`docs/testing.md`](./docs/testing.md) for the testing strategy.

## License

This project is currently unlicensed — all rights reserved by the author.

---

<p align="center">
  Built with Next.js, Supabase, and Stripe. Questions or ideas? Open an <a href="https://github.com/AmineMabrouk17/ecommerce-website/issues">issue</a>.
</p>
