# ADR-0003: Inventory decrements on payment, no reservation

Stock is decremented only in the `payment_intent.succeeded` webhook, with an atomic guard: `UPDATE products SET stock = stock - qty WHERE id = $id AND stock >= $qty`. Zero affected rows means the item sold out mid-payment — the order is flagged for admin review/refund. There is no stock reservation at checkout; reservation would need a timeout/restore job to avoid leaking stock, which is heavy machinery for the seconds-wide window between intent creation and success. The atomic guard bounds oversell to a single concurrent unit.
