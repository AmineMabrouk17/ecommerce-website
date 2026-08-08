-- Categories and RLS.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

alter table public.categories enable row level security;

create policy "categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "categories are insertable by admins"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories are updatable by admins"
  on public.categories for update
  using (public.is_admin());

create policy "categories are deletable by admins"
  on public.categories for delete
  using (public.is_admin());
