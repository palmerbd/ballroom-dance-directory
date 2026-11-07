// ─── GET/POST /api/owner/answers ──────────────────────────────────────────────
// The Owner Portal's three questions (see lib/owner-answers.ts).
//
// Auth: `Authorization: Bearer <supabase access token>`. The signed-in user must
// own the claim: linked by user_id, or the claim's owner_email matches their
// verified email. Claim must be verified or approved.
//
// GET  ?claim_id=<id>                                  → { answers }
// POST { claim_id, first_visit, typical_student, what_different } → { answers }

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cleanAnswer, firstName } from "@/lib/owner-answers";

export const dynamic = "force-dynamic";

type ClaimRow = { id: string; studio_slug: string; owner_name: string | null; owner_email: string | null; user_id: string | null; status: string };

async function ownedClaim(req: NextRequest, claimId: string) {
  const auth  = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) return { error: "Not signed in", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user) return { error: "Session expired", status: 401 as const };
  if (!claimId) return { error: "Missing claim_id", status: 400 as const };

  const { data } = await supabaseAdmin
    .from("claims")
    .select("id, studio_slug, owner_name, owner_email, user_id, status")
    .eq("id", claimId)
    .maybeSingle();
  const claim = data as ClaimRow | null;
  if (!claim || !["verified", "approved"].includes(claim.status)) {
    return { error: "Listing not found", status: 404 as const };
  }

  const email = (user.email || "").trim().toLowerCase();
  const emailVerified = !!(user.email_confirmed_at || user.confirmed_at);
  const owns = claim.user_id === user.id ||
    (emailVerified && !!email && (claim.owner_email || "").trim().toLowerCase() === email);
  if (!owns) return { error: "This listing belongs to another account", status: 403 as const };

  return { claim };
}

export async function GET(req: NextRequest) {
  const result = await ownedClaim(req, req.nextUrl.searchParams.get("claim_id") || "");
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { data, error } = await supabaseAdmin
    .from("owner_answers")
    .select("studio_slug, first_visit, typical_student, what_different, answered_by, updated_at")
    .eq("studio_slug", result.claim.studio_slug)
    .maybeSingle();
  if (error) return NextResponse.json({ answers: null, unavailable: true });
  return NextResponse.json({ answers: data ?? null });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const result = await ownedClaim(req, typeof body.claim_id === "string" ? body.claim_id : "");
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const { claim } = result;

  const row = {
    studio_slug:     claim.studio_slug,
    claim_id:        claim.id,
    first_visit:     cleanAnswer(body.first_visit) || null,
    typical_student: cleanAnswer(body.typical_student) || null,
    what_different:  cleanAnswer(body.what_different) || null,
    answered_by:     firstName(claim.owner_name) || null,
  };

  const { data, error } = await supabaseAdmin
    .from("owner_answers")
    .upsert(row, { onConflict: "studio_slug" })
    .select("studio_slug, first_visit, typical_student, what_different, answered_by, updated_at")
    .single();
  if (error) {
    return NextResponse.json({ error: "Could not save your answers right now. Please try again shortly." }, { status: 500 });
  }

  try { revalidatePath(`/studios/${claim.studio_slug}`); } catch { /* non-fatal */ }
  return NextResponse.json({ answers: data });
}
