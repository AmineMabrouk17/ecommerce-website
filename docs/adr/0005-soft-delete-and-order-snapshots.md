# ADR-0005: Products are soft-deleted; order items snapshot the product

Admin "delete" sets `is_published = false` — the product vanishes from storefront queries but the row, its orders, and its reviews survive. Hard delete is excluded from v1 because `order_items` and `reviews` reference `products.id`. Because product titles and images can still be edited after a sale, `order_items` additionally snapshots the product `title` and a leading `image` at purchase time, so order history and receipts read the same even if the catalog later changes.
