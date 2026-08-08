# E-commerce Engine

A custom-built online store: a Next.js storefront backed by Supabase (Postgres, Auth, Storage) with Stripe payments. Single context — catalog, cart, checkout, and fulfillment are one system.

## Language

**Money**:
All amounts are integer cents in USD; display converts to dollars.
_Avoid_: numeric/float dollars, multi-currency amounts

**Product**:
A single sellable unit with one price and one stock count.
_Avoid_: variant, SKU (as a distinct entity), option, item

**Trending**:
A product ranking signal: units ordered across recent paid orders, falling back to newest arrivals when no sales exist.
_Avoid_: bestsellers, popular, top-rated

**Compare-at price**:
An optional, higher reference price used to show savings on a product.
_Avoid_: original price, MSRP, list price

**Category**:
A named grouping of products (e.g. Shoes, Apparel).
_Avoid_: collection, department

**Cart**:
A customer's in-progress selection of products with quantities, persisted locally.
_Avoid_: basket, bag, shopping cart

**Order**:
A customer's commitment to purchase: a set of order items plus shipping, with a total amount.
_Avoid_: purchase, transaction, invoice, sale

**Order item**:
A single product, quantity, and unit price within an order.
_Avoid_: line item, purchase item

**Order lifecycle**:
The states an order moves through: pending (payment not confirmed), paid (payment succeeded, stock decremented), shipped, delivered, cancelled (voided; refunded if paid).
_Avoid_: status names outside this set

**Customer**:
A registered user in the shopper role who places orders.
_Avoid_: client, buyer, member

**Admin**:
A customer with elevated privileges who manages the catalog and fulfills orders.
_Avoid_: operator, manager, staff

**Review**:
Verified-purchase feedback (a rating and comment) a customer leaves on a product they bought.
_Avoid_: rating (the numeric field), comment, testimonial

**Stock**:
The count of units of a product available to sell.
_Avoid_: inventory, quantity on hand

**Checkout**:
The flow that turns a customer's cart into a pending order and takes payment.
_Avoid_: purchase flow, payment page, buy now

**Shipping**:
The flat fee added to an order's item subtotal, waived above the free-shipping threshold.
_Avoid_: delivery fee, postage, handling
