// ─── GET /api/claims?slug=xxx ─────────────────────────────────────────────────
// Accepts: ?slug=xxx  OR  ?studio_slug=xxx  (relay compatibility)
// Returns: { claimed: bool, status: string|null, studio_slug: string }
// Auth:    none — public read (boolean only, no PII)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const slug =
    req.nextUrl.searchParams.get("slug") ||
    req.nextUrl.searchParams.get("studio_slug");
  if (!slug)
    return NextResponse.json(
      { claimed: false, status: null, studio_slug: "" },
      { status: 400 }
    );
  try {
    const { data } = await supabaseAdmin
      .from("claims")
      .select("status")
      .eq("studio_slug", slug)
      .in("status", ["verified", "approved"])
      .maybeSingle();
    return NextResponse.json({
      claimed: !!data,
      status: data?.status || null,
      studio_slug: slug,
    });
  } catch {
    return NextResponse.json({ claimed: false, status: null, studio_slug: slug });
  }
}
