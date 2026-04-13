// ─── GET /api/competition-claim/status?slug=xxx ───────────────────────────────
// Returns whether a competition has already been claimed.
// Used by the claim wizard to show the "already_claimed" step before sending OTP.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("competition_claims")
    .select("id, status, tier")
    .eq("competition_slug", slug)
    .in("status", ["pending", "verified", "approved"])
    .maybeSingle();

  if (error) {
    console.error("GET /api/competition-claim/status error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    claimed: !!data,
    status:  data?.status ?? null,
    tier:    data?.tier   ?? null,
  });
}
