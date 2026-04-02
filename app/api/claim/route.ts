// ─── POST /api/claim ──────────────────────────────────────────────────────────
// Called by /claim/callback after Supabase magic link is verified.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const WP_API_URL = process.env.WP_API_URL || "http://5.78.144.42/wp-json";
const WP_APP_USER = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

function wpAuthHeader(): string {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studio_id, studio_slug, studio_title, owner_name, owner_email, owner_phone, user_id } = body;

    if (!studio_id || !studio_slug || !owner_name || !owner_email || !user_id) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("claims").select("id, status")
      .eq("studio_slug", studio_slug)
      .in("status", ["pending", "verified", "approved"]).maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, code: "already_claimed", message: "This listing has already been claimed." },
        { status: 409 }
      );
    }

    const { data: claim, error: insertError } = await supabaseAdmin
      .from("claims").insert({
        studio_id: Number(studio_id), studio_slug, studio_title,
        owner_name, owner_email, owner_phone: owner_phone || "", user_id, status: "verified",
      }).select().single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ success: false, message: "Failed to record claim. Please try again." }, { status: 500 });
    }

    if (WP_APP_PASSWORD) {
      try {
        const wpRes = await fetch(`${WP_API_URL}/wp/v2/dance_studio/${studio_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": wpAuthHeader() },
          body: JSON.stringify({ acf: { studio_tier: "claimed" } }),
        });
        if (!wpRes.ok) console.warn(`WP tier update failed (${wpRes.status})`);
      } catch (wpErr) { console.warn("WP tier update threw:", wpErr); }
    }

    return NextResponse.json({ success: true, claim_id: claim.id });
  } catch (err) {
    console.error("POST /api/claim error:", err);
    return NextResponse.json({ success: false, message: "Server error. Please try again." }, { status: 500 });
  }
}
