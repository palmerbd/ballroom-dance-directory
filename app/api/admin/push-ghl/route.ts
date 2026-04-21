/**
 * /api/admin/push-ghl
 * ────────────────────
 * Creates (or updates) a GHL contact + opportunity for a claimed studio owner.
 * Called from the admin dashboard when you click "Push to GHL" on a claim.
 *
 * POST /api/admin/push-ghl
 * Authorization: Bearer <ADMIN_SECRET>
 * Body: { claim_id, owner_name, owner_email, owner_phone,
 *         studio_title, studio_slug, tier }
 *
 * GHL flow:
 *  1. Upsert contact by email (create or find existing)
 *  2. Fetch the first pipeline from this GHL location
 *  3. Create an opportunity in the correct stage based on tier:
 *     - "claimed"  → stage named "Claimed — Free"  (first stage)
 *     - "paid"     → stage named "Featured"        (last stage)
 *  4. Tag the contact: "bdd-claimed" or "bdd-featured"
 *  5. Return the GHL contact ID and opportunity ID
 */

import { NextRequest, NextResponse } from "next/server";

const GHL_BASE    = "https://services.leadconnectorhq.com";
const GHL_TOKEN   = process.env.GHL_API_TOKEN!;
const LOCATION_ID = "gKAwJUdSQ6QMlAc0QXWb";
const GHL_VERSION = "2021-07-28";

// Studio Owner Pipeline (confirmed 2026-04-19)
const PIPELINE_ID        = "LF3giKT3c7he0Few1f51";
const STAGE_CLAIMED_ID   = "3159abd3-a1e1-4047-9b7f-f2f46146ac7d"; // "Claimed"
const STAGE_FEATURED_ID  = "ee33ef09-6042-4916-9984-04b3e1c4231a"; // "Featured (Paid)"

const GHL_HEADERS = {
  "Authorization": `Bearer ${GHL_TOKEN}`,
  "Version":       GHL_VERSION,
  "Content-Type":  "application/json",
};

// ── Helper: GHL fetch wrapper ─────────────────────────────────────────────────

async function ghl<T>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    method,
    headers: GHL_HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth check ────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    claim_id,
    owner_name,
    owner_email,
    owner_phone,
    studio_title,
    studio_slug,
    tier,
  } = await req.json();

  if (!owner_email || !studio_slug) {
    return NextResponse.json({ error: "Missing owner_email or studio_slug" }, { status: 400 });
  }

  const listingUrl = `https://www.ballroomdancedirectory.com/studios/${studio_slug}`;
  const [firstName, ...rest] = (owner_name ?? "Studio Owner").split(" ");
  const lastName = rest.join(" ") || "Owner";
  const tag = tier === "paid" ? "bdd-featured" : "bdd-claimed";

  try {
    // ── 1. Upsert GHL contact ─────────────────────────────────────────────────
    let contactId: string;

    // Search for existing contact by email
    const searchRes = await ghl<any>(
      "GET",
      `/contacts/?locationId=${LOCATION_ID}&query=${encodeURIComponent(owner_email)}`
    );

    const existing = searchRes?.contacts?.find(
      (c: any) => c.email?.toLowerCase() === owner_email.toLowerCase()
    );

    if (existing) {
      contactId = existing.id;
      // Update contact with latest info + tag
      await ghl("PUT", `/contacts/${contactId}`, {
        firstName,
        lastName,
        phone: owner_phone ?? "",
        tags: [tag, "ballroom-dance-directory"],
        customFields: [
          { key: "studio_name",  field_value: studio_title },
          { key: "studio_slug",  field_value: studio_slug  },
          { key: "listing_url",  field_value: listingUrl   },
          { key: "claim_id",     field_value: claim_id     },
          { key: "studio_tier",  field_value: tier         },
        ],
      });
    } else {
      // Create new contact
      const createRes = await ghl<any>("POST", `/contacts/`, {
        locationId: LOCATION_ID,
        firstName,
        lastName,
        email: owner_email,
        phone: owner_phone ?? "",
        source: "Ballroom Dance Directory",
        tags: [tag, "ballroom-dance-directory"],
        customFields: [
          { key: "studio_name",  field_value: studio_title },
          { key: "studio_slug",  field_value: studio_slug  },
          { key: "listing_url",  field_value: listingUrl   },
          { key: "claim_id",     field_value: claim_id     },
          { key: "studio_tier",  field_value: tier         },
        ],
      });
      contactId = createRes?.contact?.id;
    }

    if (!contactId) {
      throw new Error("Failed to get GHL contact ID");
    }

    // ── 2. Create opportunity (using hardcoded pipeline + stage IDs) ──────────
    const stageId = tier === "paid" ? STAGE_FEATURED_ID : STAGE_CLAIMED_ID;
    const stageName = tier === "paid" ? "Featured (Paid)" : "Claimed";

    const oppRes = await ghl<any>("POST", `/opportunities/`, {
      pipelineId:      PIPELINE_ID,
      pipelineStageId: stageId,
      locationId:      LOCATION_ID,
      contactId,
      name:  `${studio_title} — ${tier === "paid" ? "Featured" : "Claimed (Free)"}`,
      status: tier === "paid" ? "won" : "open",
      monetaryValue: tier === "paid" ? 49 : 0,
      customFields: [
        { key: "listing_url", field_value: listingUrl },
        { key: "claim_id",    field_value: claim_id   },
      ],
    });

    const opportunityId = oppRes?.opportunity?.id;

    return NextResponse.json({
      success:       true,
      contactId,
      opportunityId,
      pipeline:      "Studio Owner Pipeline",
      stage:         stageName,
    });

  } catch (err: any) {
    console.error("GHL push error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
