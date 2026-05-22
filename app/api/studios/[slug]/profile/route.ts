// ─── GET/POST /api/studios/[slug]/profile ────────────────────────────────────
// GET  — returns the studio_profiles row for a slug (public)
// POST — upserts profile data (requires valid claim_id for the slug, paid tier)

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("studio_profiles")
    .select("*")
    .eq("studio_slug", slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? {});
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { claim_id, ...fields } = body as {
    claim_id: string;
    custom_description?: string;
    facebook_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    show_google_reviews?: boolean;
    promo_text?: string;
    promo_type?: string;
    promo_savings?: string;
    promo_end_date?: string | null;
  };

  if (!claim_id) {
    return NextResponse.json({ error: "claim_id required" }, { status: 400 });
  }

  // Verify the claim belongs to this studio and is paid tier
  const { data: claim, error: claimErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_slug, tier, status")
    .eq("id", claim_id)
    .eq("studio_slug", slug)
    .maybeSingle();

  if (claimErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }
  if (claim.tier !== "paid") {
    return NextResponse.json({ error: "Featured tier required" }, { status: 403 });
  }

  // Sanitize social URLs — must be empty or start with https://
  const sanitizeUrl = (url: unknown) => {
    if (!url || url === "") return null;
    const s = String(url).trim();
    if (!s.startsWith("http")) return null;
    return s;
  };

  const payload = {
    studio_slug:         slug,
    claim_id,
    custom_description:  fields.custom_description  ?? null,
    facebook_url:        sanitizeUrl(fields.facebook_url),
    instagram_url:       sanitizeUrl(fields.instagram_url),
    tiktok_url:          sanitizeUrl(fields.tiktok_url),
    show_google_reviews: fields.show_google_reviews ?? false,
    promo_text:          fields.promo_text   || null,
    promo_type:          fields.promo_type   || null,
    promo_savings:       fields.promo_savings || null,
    promo_end_date:      fields.promo_end_date || null,
    updated_at:          new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("studio_profiles")
    .upsert(payload, { onConflict: "studio_slug" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Revalidate the studio detail page so changes show immediately
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";
    await fetch(`${base}/api/revalidate?path=/studios/${slug}`, { method: "POST" });
  } catch {
    // Non-fatal — ISR will catch up on next request
  }

  return NextResponse.json({ ok: true, data });
}
