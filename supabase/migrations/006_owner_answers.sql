-- ─── Migration 006: Owner answers (Nov 2026) ─────────────────────────────────
-- Three questions every claimed studio owner can answer in the Owner Portal,
-- free on every plan. Shown on the public studio page as the owner's own words,
-- with their first name and the date. Written only through /api/owner/answers
-- (service role), so RLS allows the service role only.

create table if not exists public.owner_answers (
  id               uuid        primary key default gen_random_uuid(),
  studio_slug      text        not null unique,
  claim_id         uuid        references public.claims(id) on delete cascade,
  first_visit      text,
  typical_student  text,
  what_different   text,
  answered_by      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.owner_answers enable row level security;

create policy "Service role full access to owner_answers"
  on public.owner_answers for all to service_role
  using (true) with check (true);

create trigger owner_answers_set_updated_at
  before update on public.owner_answers
  for each row execute function public.set_updated_at();
