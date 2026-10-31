// ─── GET /api/owner/claims ────────────────────────────────────────────────────
// Returns every studio listing the signed-in owner manages.
//
// Auth: `Authorization: Bearer <supabase access token>` from the browser session.
// Matches claims by user_id OR by owner_email (exact, case-insensitive). Claims that
// were created by an admin (user_id = null, e.g. owners onboarded by email) are linked
// to the account the first time that owner signs in with the same verified email.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStudio } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

type ClaimRow = { id: string; studio_slug: string; owner_email: string | null; user_id: string | null; status: string; created_at: string };

export async function GET(req: NextRequest) {
  const auth  = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user) return NextResponse.json({ error: "Session expired" }, { status: 401 });

  const email = (user.email || "").trim().toLowerCase();
  const emailVerified = !!(user.email_confirmed_at || user.confirmed_at);

  // 1. Claims already tied to this account.
  const { data: byUser } = await supabaseAdmin
    .from("claims").select("*").eq("user_id", user.id);

  // 2. Claims filed under this email. ilike wildcards (_ %) are escaped, then the
  //    match is re-checked exactly so a look-alike address can never match.
  let byEmail: ClaimRow[] = [];
  if (email && emailVerified) {
    const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
    const { data } = await supabaseAdmin.from("claims").select("*").ilike("owner_email", pattern);
    byEmail = ((data || []) as ClaimRow[]).filter((c) => (c.owner_email || "").trim().toLowerCase() === email);

    // Link unowned claims to this account so the rest of the dashboard (RLS) works.
    const unlinked = byEmail.filter((c) => !c.user_id).map((c) => c.id);
    if (unlinked.length) {
      await supabaseAdmin.from("claims").update({ user_id: user.id }).in("id", unlinked);
    }
  }

  // Merge, drop rejected, newest first, one claim per listing.
  const all = [...((byUser || []) as ClaimRow[]), ...byEmail]
    .filter((c) => c.status !== "rejected")
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const seen = new Set<string>();
  const claims = all.filter((c) => (seen.has(c.studio_slug) ? false : (seen.add(c.studio_slug), true)));

  // Enrich each listing with what the dashboard needs: the public listing data from
  // WordPress (for the profile checklist and preview), the photo count and the
  // owner-edited Featured profile. Any lookup that fails just comes back empty.
  const enriched = await Promise.all(claims.map(async (c) => {
    const [studio, photos, profile] = await Promise.all([
      getStudio(c.studio_slug).catch(() => null),
      supabaseAdmin.from("studio_photos").select("id", { count: "exact", head: true }).eq("studio_slug", c.studio_slug),
      supabaseAdmin.from("studio_profiles")
        .select("custom_description, facebook_url, instagram_url, tiktok_url, promo_text, show_google_reviews")
        .eq("studio_slug", c.studio_slug).maybeSingle(),
    ]);
    const listing = studio ? {
      title:        studio.title,
      address:      studio.address || "",
      city:         studio.city || "",
      state:        studio.state || "",
      zip:          studio.zip || "",
      phone:        studio.phone || "",
      email:        studio.email || "",
      website:      studio.website || "",
      hours:        studio.hours || {},
      danceStyles:  studio.danceStyles || [],
      tagline:      studio.tagline || "",
    } : null;
    return { ...c, listing, photo_count: photos.count ?? 0, profile: profile.data ?? null };
  }));

  return NextResponse.json({ email: user.email, claims: enriched });
}
