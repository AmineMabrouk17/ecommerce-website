-- Orders, order status enum, and RLS.

create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'pending',
  total_amount int not null check (total_amount >= 0),
  shipping_amount int not null check (shipping_amount >= 0),
  stripe_payment_intent_id text unique,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

alter table public.orders enable row level security;

create policy "orders are viewable by their owner"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders are viewable by admins"
  on public.orders for select
  using (public.is_admin());

create policy "orders are insertable by their owner"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "orders are insertable by admins"
  on public.orders for insert
  with check (public.is_admin());

create policy "orders are updatable by admins"
  on public.orders for update
  using (public.is_admin());

create policy "orders are deletable by admins"
  on public.orders for delete
  using (public.is_admin());
