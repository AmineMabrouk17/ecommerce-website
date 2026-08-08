-- Reviews, verified-purchase gate, and RLS.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index reviews_product_id_idx on public.reviews (product_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute procedure public.set_updated_at();

-- Only customers with a paid or delivered order containing the product may review it.
create or replace function public.can_review(user_id uuid, product_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.user_id = can_review.user_id
      and oi.product_id = can_review.product_id
      and o.status in ('paid', 'delivered')
  );
$$;

alter table public.reviews enable row level security;

create policy "reviews are viewable by their author"
  on public.reviews for select
  using (auth.uid() = user_id);

create policy "reviews are viewable by admins"
  on public.reviews for select
  using (public.is_admin());

create policy "reviews are insertable by verified purchasers"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and public.can_review(user_id, product_id)
  );

create policy "reviews are insertable by admins"
  on public.reviews for insert
  with check (public.is_admin());

create policy "reviews are updatable by admins"
  on public.reviews for update
  using (public.is_admin());

create policy "reviews are deletable by admins"
  on public.reviews for delete
  using (public.is_admin());
