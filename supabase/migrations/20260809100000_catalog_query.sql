-- Server-side catalog query: filters, full-text search, sort, and pagination.
-- Relevance ranking needs ts_rank, which PostgREST cannot order by, so the
-- storefront catalog page delegates the whole query to this function.

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
      case
        when search_text is null then 0::real
        else ts_rank(p.fts_vector, query)
      end as rank
    from public.products p
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
