-- Atomic stock restore for admin refunds of paid orders.

create or replace function public.restore_stock(p_product_id uuid, p_quantity int)
returns boolean
language sql
as $$
  with applied as (
    update public.products
    set stock = stock + p_quantity
    where id = p_product_id
    returning id
  )
  select exists (select 1 from applied);
$$;
