-- Stock-guard flag on orders and the atomic stock decrement for the Stripe webhook.

alter table public.orders
  add column stock_guard_failed boolean not null default false;

create or replace function public.decrement_stock_if_available(p_product_id uuid, p_quantity int)
returns boolean
language sql
as $$
  with applied as (
    update public.products
    set stock = stock - p_quantity
    where id = p_product_id and stock >= p_quantity
    returning id
  )
  select exists (select 1 from applied);
$$;
