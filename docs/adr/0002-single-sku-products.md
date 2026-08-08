# ADR-0002: Single-SKU products, no variants in v1

Products are single-SKU: one price, one stock count, no size/color variants table. On the product detail page, the "variant selector" is the quantity selector. Variants were deferred despite appearing in the UI brief: they would add a `product_variants` table plus per-variant stock, images, and pricing, rippling through cart, orders, admin, and the webhook. If options are needed later, the migration adds a variants table without touching the money or order models.
