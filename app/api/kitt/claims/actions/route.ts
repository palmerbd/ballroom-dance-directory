/**
 * GET /api/kitt/claims/actions
 * ─────────────────────────────────────────────────────────────────────────────
 * Action catalog for KITT HQ — returns all available actions per claim type
 * with required params, applicable status/tier constraints, and side-effect
 * documentation. KITT uses this to render the correct buttons per claim.
 *
 * Auth: X-KITT-Hook-Secret header (same secret as all /api/kitt/* endpoints)
 *
 * Response:
 * {
 *   studio:      ActionDef[],
 *   competition: ActionDef[],
 * }
 *
 * ActionDef shape:
 * {
 *   action:           string,
 *   label:            string,
 *   description:      string,
 *   required_status?: string,   // claim.status must equal this before calling
 *   required_tier?:   string,   // claim.tier must equal this before calling
 *   params:           ParamDef[],
 *   side_effects:     string[],
 * }
 */

import { NextRequest, NextResponse } from "next/server";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-kitt-hook-secret") ?? "";
  return secret === process.env.KITT_HOOK_SECRET;
}

const CATALOG = {
  studio: [
    {
      action:          "approve",
      label:           "Approve",
      description:     "Approve a verified studio claim. Sets status to 'approved', grants the owner dashboard access, and sends a branded approval email.",
      required_status: "verified",
      params:          [],
      side_effects: [
        "supabase(claims): status → 'approved'",
        "resend: approval email → owner_email (dashboard link + listing link)",
      ],
    },
    {
      action:          "reject",
      label:           "Reject",
      description:     "Reject a verified studio claim. Sets status to 'rejected' and sends a polite rejection email. The free listing stays live.",
      required_status: "verified",
      params: [
        {
          name:        "reason",
          type:        "string",
          required:    false,
          description: "Optional rejection reason — included verbatim in the rejection email",
        },
      ],
      side_effects: [
        "supabase(claims): status → 'rejected'",
        "resend: rejection email → owner_email (includes params.reason if provided)",
      ],
    },
    {
      action:          "make_featured",
      label:           "Make Featured",
      description:     "Upgrade an approved studio from free (claimed) tier to Featured (paid) tier without requiring a Stripe payment. Use to comp a studio.",
      required_status: "approved",
      required_tier:   "claimed",
      params:          [],
      side_effects: [
        "supabase(claims): tier → 'paid'",
        "wordpress: acf.studio_tier → 'paid' via WP REST API (non-fatal — proceeds even if WP is unreachable)",
      ],
    },
    {
      action:          "push_ghl",
      label:           "Push to GHL",
      description:     "Upsert the studio owner as a GoHighLevel contact and create an opportunity in the Studio Owner Pipeline at the correct stage.",
      required_status: "approved",
      params:          [],
      side_effects: [
        "ghl: create or update contact (tags: bdd-claimed or bdd-featured, custom fields: studio_name, studio_slug, listing_url, claim_id, studio_tier)",
        "ghl: create opportunity in Studio Owner Pipeline (stage: Claimed or Featured (Paid) based on tier)",
      ],
    },
  ],
  competition: [
    {
      action:          "approve",
      label:           "Approve",
      description:     "Approve a verified competition claim. Sets status to 'approved' and sends a branded approval email to the organizer.",
      required_status: "verified",
      params:          [],
      side_effects: [
        "supabase(competition_claims): status → 'approved'",
        "resend: approval email → organizer_email (listing link)",
      ],
    },
    {
      action:          "reject",
      label:           "Reject",
      description:     "Reject a verified competition claim. Sets status to 'rejected' and sends a polite rejection email. The competition listing stays live.",
      required_status: "verified",
      params: [
        {
          name:        "reason",
          type:        "string",
          required:    false,
          description: "Optional rejection reason — included verbatim in the rejection email",
        },
      ],
      side_effects: [
        "supabase(competition_claims): status → 'rejected'",
        "resend: rejection email → organizer_email (includes params.reason if provided)",
      ],
    },
  ],
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(CATALOG, {
    headers: { "Cache-Control": "no-store" },
  });
}
