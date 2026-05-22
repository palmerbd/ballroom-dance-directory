-- ─── Migration 004: Studio Profiles & Google Reviews ────────────────────────
-- Adds owner-editable profile fields (description, social links, promotions)
-- and a Google Reviews cache table for Featured-tier studios.

-- ── studio_profiles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studio_profiles (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_slug         text        NOT NULL UNIQUE,
  claim_id            uuid        REFERENCES claims(id) ON DELETE CASCADE,

  -- Owner-written content
  custom_description  text,

  -- Social media
  facebook_url        text,
  instagram_url       text,
  tiktok_url          text,

  -- Google Reviews toggle
  show_google_reviews boolean     DEFAULT false,
  google_place_id     text,       -- cached after first lookup

  -- Current promotion
  promo_text          text,
  promo_type          text        CHECK (promo_type IN ('percentage','dollar','free_trial','custom')),
  promo_savings       text,       -- e.g. "20%" or "$30 off"
  promo_end_date      date,

  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ── studio_reviews ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studio_reviews (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_slug         text        NOT NULL,
  author_name         text,
  author_photo_url    text,
  rating              numeric(2,1),
  review_text         text,
  time_description    text,       -- "2 months ago"
  fetched_at          timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_studio_profiles_slug    ON studio_profiles(studio_slug);
CREATE INDEX IF NOT EXISTS idx_studio_reviews_slug     ON studio_reviews(studio_slug);
CREATE INDEX IF NOT EXISTS idx_studio_reviews_fetched  ON studio_reviews(studio_slug, fetched_at DESC);

-- RLS: studio owners can only read/write their own profile
ALTER TABLE studio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_reviews  ENABLE ROW LEVEL SECURITY;

-- Allow service-role (API routes) full access
CREATE POLICY "Service role full access on studio_profiles"
  ON studio_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on studio_reviews"
  ON studio_reviews FOR ALL
  USING (true)
  WITH CHECK (true);

-- Public read access (for studio detail pages served by Next.js)
CREATE POLICY "Public read studio_profiles"
  ON studio_profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read studio_reviews"
  ON studio_reviews FOR SELECT
  TO anon
  USING (true);
