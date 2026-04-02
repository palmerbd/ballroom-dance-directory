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

export interface Claim {
  id:            string;
  studio_id:     number;
  studio_slug:   string;
  studio_title:  string;
  owner_name:    string;
  owner_email:   string;
  owner_phone:   string;
  user_id:       string;
  status:        ClaimStatus;
  created_at:    string;
}
