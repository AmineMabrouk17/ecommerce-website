-- Newsletter subscriptions for the storefront newsletter band. Emails are
-- collected only; no sending yet.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "anyone can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "subscribers are viewable by admins"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());
