// ─── GET /api/studios/[slug]/photos ───────────────────────────────────────────
// Returns the ordered list of studio photos for a given studio slug.
// Used by PhotoManager (dashboard) and the studio detail page.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("studio_photos")
    .select("id, url")
    .eq("studio_slug", slug)
    .order("created_at", { ascending: true })
    .limit(6);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ photos: data ?? [] });
}
