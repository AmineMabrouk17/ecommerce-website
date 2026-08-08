-- Order items with product snapshots and RLS.

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price int not null check (unit_price >= 0),
  product_title text not null,
  product_image text,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

alter table public.order_items enable row level security;

create policy "order items are viewable by their order owner"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order items are viewable by admins"
  on public.order_items for select
  using (public.is_admin());

create policy "order items are insertable by their order owner"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order items are insertable by admins"
  on public.order_items for insert
  with check (public.is_admin());

create policy "order items are updatable by admins"
  on public.order_items for update
  using (public.is_admin());

create policy "order items are deletable by admins"
  on public.order_items for delete
  using (public.is_admin());
