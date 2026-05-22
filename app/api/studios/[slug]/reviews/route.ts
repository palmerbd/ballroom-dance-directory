// ─── POST /api/studios/[slug]/reviews ────────────────────────────────────────
// Fetches up to 5 Google reviews for a studio via the Places API and caches
// them in the studio_reviews table. Called when a Featured owner toggles
// "Show Google Reviews" on in their dashboard.
//
// GET  — returns cached reviews for display on studio page
// POST — triggers a fresh fetch from Google Places API

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// ── GET — return cached reviews ───────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("studio_reviews")
    .select("*")
    .eq("studio_slug", slug)
    .order("fetched_at", { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST — fetch fresh reviews from Google ────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: { claim_id: string; studio_title: string; city: string; state: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { claim_id, studio_title, city, state } = body;

  if (!claim_id || !studio_title) {
    return NextResponse.json({ error: "claim_id and studio_title required" }, { status: 400 });
  }

  // Verify paid tier
  const { data: claim, error: claimErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_slug, tier")
    .eq("id", claim_id)
    .eq("studio_slug", slug)
    .maybeSingle();

  if (claimErr || !claim || claim.tier !== "paid") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (!PLACES_API_KEY) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
  }

  // Step 1: Find place_id using studio name + city
  const searchQuery = encodeURIComponent(`${studio_title} ${city} ${state}`);
  const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&fields=place_id,name&key=${PLACES_API_KEY}`;

  let placeId: string | null = null;

  // Check if we already have a cached place_id in studio_profiles
  const { data: profile } = await supabaseAdmin
    .from("studio_profiles")
    .select("google_place_id")
    .eq("studio_slug", slug)
    .maybeSingle();

  if (profile?.google_place_id) {
    placeId = profile.google_place_id;
  } else {
    const findRes = await fetch(findUrl);
    const findData = await findRes.json();
    if (findData.candidates?.[0]?.place_id) {
      placeId = findData.candidates[0].place_id;
      // Cache it
      await supabaseAdmin
        .from("studio_profiles")
        .upsert({ studio_slug: slug, google_place_id: placeId, claim_id }, { onConflict: "studio_slug" });
    }
  }

  if (!placeId) {
    return NextResponse.json({ error: "Could not locate this studio on Google" }, { status: 404 });
  }

  // Step 2: Fetch reviews via Place Details
  const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${PLACES_API_KEY}`;
  const detailRes  = await fetch(detailUrl);
  const detailData = await detailRes.json();

  const rawReviews = detailData.result?.reviews ?? [];
  if (!rawReviews.length) {
    return NextResponse.json({ ok: true, count: 0, reviews: [] });
  }

  // Step 3: Delete old cached reviews, insert fresh ones
  await supabaseAdmin.from("studio_reviews").delete().eq("studio_slug", slug);

  const rows = rawReviews.slice(0, 5).map((r: {
    author_name: string;
    profile_photo_url?: string;
    rating: number;
    text: string;
    relative_time_description: string;
  }) => ({
    studio_slug:      slug,
    author_name:      r.author_name,
    author_photo_url: r.profile_photo_url ?? null,
    rating:           r.rating,
    review_text:      r.text,
    time_description: r.relative_time_description,
  }));

  const { error: insertErr } = await supabaseAdmin.from("studio_reviews").insert(rows);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  // Revalidate studio page
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";
    await fetch(`${base}/api/revalidate?path=/studios/${slug}`, { method: "POST" });
  } catch { /* non-fatal */ }

  return NextResponse.json({ ok: true, count: rows.length, reviews: rows });
}
