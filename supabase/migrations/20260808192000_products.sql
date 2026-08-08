-- Products with full-text search, triggers, and RLS.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  price int not null check (price >= 0),
  compare_at_price int check (compare_at_price > price),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  fts_vector tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_published_idx on public.products (is_published) where is_published;

create or replace function public.products_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.fts_vector := to_tsvector('english', coalesce(new.name, '') || ' ' || coalesce(new.description, ''));
  return new;
end;
$$;

create trigger products_search_vector_update
  before insert or update of name, description on public.products
  for each row execute procedure public.products_search_vector();

create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create index products_fts_vector_idx on public.products using gin (fts_vector);

alter table public.products enable row level security;

create policy "published products are viewable by everyone"
  on public.products for select
  using (is_published);

create policy "products are viewable by admins"
  on public.products for select
  using (public.is_admin());

create policy "products are insertable by admins"
  on public.products for insert
  with check (public.is_admin());

create policy "products are updatable by admins"
  on public.products for update
  using (public.is_admin());

create policy "products are deletable by admins"
  on public.products for delete
  using (public.is_admin());
