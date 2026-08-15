-- Extend catalog_products to return the product's category name and stock so
-- product cards can show a category eyebrow and a live Add-to-cart button.
-- Replaces the 20260809100000 version. The return type (OUT params) changed,
-- so Postgres requires a drop before the create.

drop function if exists public.catalog_products(text, text, integer, integer, boolean, text, integer, integer);

create or replace function public.catalog_products(
  search_text text default null,
  category_slug text default null,
  min_price_cents int default null,
  max_price_cents int default null,
  in_stock_only boolean default false,
  sort_key text default 'newest',
  page_num int default 1,
  page_size int default 24
)
returns table (
  id uuid,
  name text,
  slug text,
  price int,
  compare_at_price int,
  images text[],
  created_at timestamptz,
  category_name text,
  stock int,
  total_count bigint
)
language plpgsql
stable
as $$
declare
  query tsquery;
begin
  query := websearch_to_tsquery('english', coalesce(search_text, ''));

  return query
  with filtered as (
    select
      p.id,
      p.name,
      p.slug,
      p.price,
      p.compare_at_price,
      p.images,
      p.created_at,
      c.name as category_name,
      p.stock,
      case
        when search_text is null then 0::real
        else ts_rank(p.fts_vector, query)
      end as rank
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p.is_published
      and (category_slug is null or exists (
        select 1 from public.categories c
        where c.id = p.category_id and c.slug = category_slug
      ))
      and (min_price_cents is null or p.price >= min_price_cents)
      and (max_price_cents is null or p.price <= max_price_cents)
      and (not in_stock_only or p.stock > 0)
      and (search_text is null or p.fts_vector @@ query)
  )
  select
    f.id,
    f.name,
    f.slug,
    f.price,
    f.compare_at_price,
    f.images,
    f.created_at,
    f.category_name,
    f.stock,
    count(*) over () as total_count
  from filtered f
  order by
    case when sort_key = 'price_asc' then f.price end asc,
    case when sort_key = 'price_desc' then f.price end desc,
    case when sort_key = 'relevance' and search_text is not null then f.rank end desc,
    f.created_at desc
  limit page_size
  offset greatest((page_num - 1) * page_size, 0);
end;
$$;
