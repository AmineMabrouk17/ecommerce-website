-- Which customers verified-purchased a product? Public storefront queries use
-- this to badge reviews as "Verified Buyer" without exposing order rows, which
-- are RLS-restricted to their owners.
create or replace function public.verified_review_user_ids(product_id uuid)
returns setof uuid
language sql
stable
security definer set search_path = public
as $$
  select distinct o.user_id
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  where oi.product_id = verified_review_user_ids.product_id
    and o.status in ('paid', 'delivered');
$$;
