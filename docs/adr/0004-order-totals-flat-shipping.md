# ADR-0004: Order totals are subtotal plus flat shipping, no tax

Order totals are the item subtotal plus a flat shipping amount, computed on the server at checkout and mirrored exactly into the Stripe PaymentIntent. Shipping is a fixed fee waived above a subtotal threshold. Tax is deliberately excluded from v1 because it is jurisdiction-dependent and legally sensitive; adding it later is additive (a `tax_amount` column plus a provider), not a migration of existing order data.
