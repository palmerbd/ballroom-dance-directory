-- ─── Migration 005: competition_claims + competition_overrides ────────────────
-- competition_claims: one row per organizer claim, mirrors the studio claims table.
-- competition_overrides: organizer-editable fields that overlay the static seed data
--   (Stage 3 — dashboard edit form writes here; detail pages read overrides first).

-- ── competition_claims ─────────────────────────────────────────────────────────

create table if not exists competition_claims (
  id                     uuid primary key default gen_random_uuid(),
  competition_slug       text not null,
  competition_name       text not null,
  organizer_name         text not null,
  organizer_email        text not null,
  organizer_phone        text not null default '',
  user_id                uuid not null references auth.users(id) on delete cascade,
  status                 text not null default 'verified'
                           check (status in ('pending','verified','approved','rejected')),
  tier                   text not null default 'free'
                           check (tier in ('free','featured')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- Only one active claim per competition
  unique (competition_slug)
);

-- ── competition_overrides ──────────────────────────────────────────────────────
-- Stores organizer-submitted updates (Stage 3).
-- All fields nullable — only populate what the organizer has changed.

create table if not exists competition_overrides (
  id                   uuid primary key default gen_random_uuid(),
  competition_slug     text not null references competition_claims(competition_slug) on delete cascade,
  claim_id             uuid not null references competition_claims(id) on delete cascade,
  date_start           date,
  date_end             date,
  venue                text,
  city                 text,
  state                text,
  description          text,
  website              text,
  registration_url     text,
  registration_deadline date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  unique (competition_slug)
);

-- ── Row-Level Security ─────────────────────────────────────────────────────────

alter table competition_claims   enable row level security;
alter table competition_overrides enable row level security;

-- competition_claims: owners can read their own row; service role does writes
create policy "Owner reads own claim"
  on competition_claims for select
  using (auth.uid() = user_id);

-- competition_overrides: owners can read + write their own override row
create policy "Owner reads own override"
  on competition_overrides for select
  using (
    exists (
      select 1 from competition_claims c
      where c.competition_slug = competition_overrides.competition_slug
        and c.user_id = auth.uid()
    )
  );

create policy "Owner upserts own override"
  on competition_overrides for insert
  with check (
    exists (
      select 1 from competition_claims c
      where c.competition_slug = competition_overrides.competition_slug
        and c.user_id = auth.uid()
    )
  );

create policy "Owner updates own override"
  on competition_overrides for update
  using (
    exists (
      select 1 from competition_claims c
      where c.competition_slug = competition_overrides.competition_slug
        and c.user_id = auth.uid()
    )
  );

-- ── updated_at trigger ─────────────────────────────────────────────────────────

create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger competition_claims_updated_at
  before update on competition_claims
  for each row execute function update_updated_at_column();

create trigger competition_overrides_updated_at
  before update on competition_overrides
  for each row execute function update_updated_at_column();
