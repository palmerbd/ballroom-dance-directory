/**
 * GET /api/kitt/claims
 * ─────────────────────────────────────────────────────────────────────────────────
 * Server-to-server read-only endpoint for the KITT HQ dashboard.
 * Returns all studio claims + competition claims from Supabase.
 *
 * Auth: X-KITT-Hook-Secret: <KITT_HOOK_SECRET env var>
 * Returns 401 without it. No browser session required.
 *
 * Response shape:
 * {
 *   studio_claims:      ClaimRecord[],
 *   competition_claims: CompClaimRecord[],
 *   summary: { studio_pending, studio_approved, competition_pending, competition_approved },
 *   fetched_at: ISO string
 * }
 *
 * Status lifecycle:
 *   pending  = email link not yet clicked
 *   verified = email confirmed, awaiting Don's manual approval  <- NEEDS ACTION
 *   approved = live; owner has dashboard access
 *   rejected = denied
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-kitt-hook-secret") ?? "";
  return secret === process.env.KITT_HOOK_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [studiosResult, compsResult] = await Promise.all([
    supabaseAdmin
      .from("claims")
      .select(
        "id, studio_id, studio_slug, studio_title, owner_name, owner_email, owner_phone, status, tier, stripe_subscription_id, created_at, updated_at"
      )
      .or(
        `status.in.(pending,verified,approved),and(status.eq.rejected,updated_at.gte.${thirtyDaysAgo})`
      )
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("competition_claims")
      .select(
        "id, competition_slug, competition_name, organizer_name, organizer_email, organizer_phone, status, tier, created_at, updated_at"
      )
      .or(
        `status.in.(pending,verified,approved),and(status.eq.rejected,updated_at.gte.${thirtyDaysAgo})`
      )
      .order("created_at", { ascending: false }),
  ]);

  if (studiosResult.error) {
    console.error("[kitt/claims] studio claims error:", studiosResult.error);
    return NextResponse.json(
      { error: "Failed to fetch studio claims: " + studiosResult.error.message },
      { status: 500 }
    );
  }

  if (compsResult.error) {
    console.error("[kitt/claims] competition claims error:", compsResult.error);
    return NextResponse.json(
      { error: "Failed to fetch competition claims: " + compsResult.error.message },
      { status: 500 }
    );
  }

  const studioClaims = studiosResult.data ?? [];
  const compClaims   = compsResult.data   ?? [];

  return NextResponse.json(
    {
      studio_claims:      studioClaims,
      competition_claims: compClaims,
      summary: {
        studio_pending:       studioClaims.filter(c => c.status === "verified").length,
        studio_approved:      studioClaims.filter(c => c.status === "approved").length,
        competition_pending:  compClaims.filter(c => c.status === "verified").length,
        competition_approved: compClaims.filter(c => c.status === "approved").length,
      },
      fetched_at: new Date().toISOString(),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
