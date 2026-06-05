/**
 * POST /api/admin/make-featured
 * ---------------------------------
 * Manually upgrades a claimed studio to Featured (paid) tier.
 * Used by admin to comp a studio without requiring a Stripe payment.
 *
 *   1. Validates admin token
 *   2. Checks claim exists, is approved, and is currently "claimed" tier
 *   3. Updates Supabase claims.tier to "paid"
 *   4. Updates WordPress ACF studio_tier to "paid" (non-fatal)
 *
 * Body: { claim_id }
 * Authorization: Bearer <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const WP_API_URL      = process.env.WP_API_URL      || "http://5.78.144.42/wp-json";
const WP_APP_USER     = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

function wpAuthHeader() {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

async function updateWpTier(studioSlug: string, tier: "claimed" | "paid") {
  try {
    const searchRes = await fetch(
      `${WP_API_URL}/wp/v2/dance_studio?slug=${studioSlug}&_fields=id`,
      { headers: { Authorization: wpAuthHeader() } }
    );
    if (!searchRes.ok) return;
    const studios = await searchRes.json() as Array<{ id: number }>;
    if (!studios.length) return;
    const studioId = studios[0].id;
    await fetch(`${WP_API_URL}/wp/v2/dance_studio/${studioId}`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": wpAuthHeader(),
      },
      body: JSON.stringify({ acf: { studio_tier: tier } }),
    });
  } catch (err) {
    console.warn(`[make-featured] WP tier update failed for ${studioSlug}:`, err);
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { claim_id } = await req.json();
  if (!claim_id) {
    return NextResponse.json({ error: "Missing claim_id" }, { status: 400 });
  }

  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_slug, studio_title, tier, status")
    .eq("id", claim_id)
    .single();

  if (fetchErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (claim.tier === "paid") {
    return NextResponse.json({ error: "Studio is already featured" }, { status: 409 });
  }

  if (claim.status !== "approved") {
    return NextResponse.json({ error: "Claim must be approved before upgrading" }, { status: 409 });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("claims")
    .update({ tier: "paid" })
    .eq("id", claim_id);

  if (updateErr) {
    console.error("[make-featured] Supabase update error:", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await updateWpTier(claim.studio_slug, "paid");

  return NextResponse.json({ success: true, claim_id, studio: claim.studio_title, tier: "paid" });
}
