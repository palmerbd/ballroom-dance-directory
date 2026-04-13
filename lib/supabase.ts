// ─── Supabase Client ──────────────────────────────────────────────────────────
// Browser-side client — safe to use in Client Components and API routes.
// For server-side (API routes that need elevated privileges), use the
// service-role client in lib/supabase-admin.ts.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton pattern — reuse across the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types ─────────────────────────────────────────────────────────────────────

export type ClaimStatus = "pending" | "verified" | "approved" | "rejected";

export type ClaimTier = "claimed" | "paid";

export interface Claim {
  id:                     string;
  studio_id:              number;
  studio_slug:            string;
  studio_title:           string;
  studio_city?:           string;
  studio_state?:          string;
  owner_name:             string;
  owner_email:            string;
  owner_phone:            string;
  user_id:                string;
  status:                 ClaimStatus;
  tier:                   ClaimTier;
  stripe_customer_id:     string | null;
  stripe_subscription_id: string | null;
  created_at:             string;
}

// ── Competition Claim ──────────────────────────────────────────────────────────
export type CompetitionClaimStatus = "pending" | "verified" | "approved" | "rejected";
export type CompetitionClaimTier   = "free" | "featured";

export interface CompetitionClaim {
  id:                     string;
  competition_slug:       string;
  competition_name:       string;
  organizer_name:         string;
  organizer_email:        string;
  organizer_phone:        string;
  user_id:                string;
  status:                 CompetitionClaimStatus;
  tier:                   CompetitionClaimTier;
  stripe_customer_id:     string | null;
  stripe_subscription_id: string | null;
  created_at:             string;
  updated_at:             string;
}

// ── Studio Profile (owner-editable Featured content) ──────────────────────────
export interface StudioProfile {
  id?:                  string;
  studio_slug:          string;
  claim_id?:            string;
  custom_description?:  string | null;
  facebook_url?:        string | null;
  instagram_url?:       string | null;
  tiktok_url?:          string | null;
  show_google_reviews?: boolean;
  google_place_id?:     string | null;
  promo_text?:          string | null;
  promo_type?:          string | null;
  promo_savings?:       string | null;
  promo_end_date?:      string | null;
  created_at?:          string;
  updated_at?:          string;
}
