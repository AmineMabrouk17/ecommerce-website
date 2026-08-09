-- Reviews are public product feedback: let anyone read them so the storefront
-- can show ratings and reviews on product pages. Verified-purchase gating on
-- writes stays enforced by can_review().
create policy "reviews are publicly readable"
  on public.reviews for select
  using (true);

-- Every review carries a comment; the app form requires one and the schema
-- enforces it so stale or seeded rows can never bypass the rule.
alter table public.reviews
  alter column comment set not null;
