/**
 * POST /api/kitt/claims/action
 * ─────────────────────────────────────────────────────────────────────────────
 * KITT HQ admin action dispatcher. Runs the exact same server-side logic as
 * the /admin command center buttons — including all email side-effects.
 *
 * Auth: X-KITT-Hook-Secret header (same secret as GET /api/kitt/claims)
 *
 * Body:
 *   {
 *     "claim_type": "studio" | "competition",
 *     "claim_id":   "<uuid>",
 *     "action":     "approve" | "reject" | "make_featured" | "push_ghl",
 *     "params":     { "reason"?: string }
 *   }
 *
 * Response (success):   200 { ok: true,  claim: <updated record>, message: "..." }
 * Response (failure):   4xx { ok: false, error: "..." }
 *
 * Action catalogue:
 *   studio / approve      → status → "approved"   + Resend approval email
 *   studio / reject       → status → "rejected"   + Resend rejection email (optional params.reason)
 *   studio / make_featured → tier  → "paid"       + WP ACF studio_tier → "paid" (non-fatal)
 *   studio / push_ghl     → GHL contact upsert + opportunity creation (no email)
 *   competition / approve → status → "approved"   + Resend approval email
 *   competition / reject  → status → "rejected"   + Resend rejection email (optional params.reason)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

// ── Constants ─────────────────────────────────────────────────────────────────

const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "leads@ballroomdancedirectory.com";
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

const WP_API_URL      = process.env.WP_API_URL      || "http://5.78.218.239/wp-json";
const WP_APP_USER     = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

const GHL_BASE    = "https://services.leadconnectorhq.com";
const GHL_TOKEN   = process.env.GHL_API_TOKEN!;
const LOCATION_ID = "gKAwJUdSQ6QMlAc0QXWb";
const GHL_VERSION = "2021-07-28";

// Studio Owner Pipeline — IDs confirmed 2026-04-19
const PIPELINE_ID       = "LF3giKT3c7he0Few1f51";
const STAGE_CLAIMED_ID  = "3159abd3-a1e1-4047-9b7f-f2f46146ac7d"; // "Claimed"
const STAGE_FEATURED_ID = "ee33ef09-6042-4916-9984-04b3e1c4231a"; // "Featured (Paid)"

const GHL_HEADERS = {
  "Authorization": `Bearer ${GHL_TOKEN}`,
  "Version":       GHL_VERSION,
  "Content-Type":  "application/json",
};

// ── Auth ──────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-kitt-hook-secret") ?? "";
  return secret === process.env.KITT_HOOK_SECRET;
}

// ── Typed result ──────────────────────────────────────────────────────────────

type ActionResult =
  | { ok: true;  claim: unknown; message: string }
  | { ok: false; error: string;  httpStatus: number };

// ── WP helper ─────────────────────────────────────────────────────────────────

function wpAuthHeader() {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

async function updateWpTier(studioSlug: string, tier: "claimed" | "paid") {
  try {
    const searchRes = await fetch(
      `${WP_API_URL}/wp/v2/dance_studio?slug=${studioSlug}&_fields=id`,
      { headers: { Authorization: wpAuthHeader() }, signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return;
    const studios = (await searchRes.json()) as Array<{ id: number }>;
    if (!studios.length) return;
    await fetch(`${WP_API_URL}/wp/v2/dance_studio/${studios[0].id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": wpAuthHeader() },
      body:    JSON.stringify({ acf: { studio_tier: tier } }),
      signal:  AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.warn(`[kitt/action] WP tier update failed for ${studioSlug}:`, err);
  }
}

// ── GHL helper ────────────────────────────────────────────────────────────────

async function ghl<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    method,
    headers: GHL_HEADERS,
    body:    body ? JSON.stringify(body) : undefined,
    signal:  AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Studio: approve ───────────────────────────────────────────────────────────

async function studioApprove(claimId: string): Promise<ActionResult> {
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_title, studio_slug, owner_name, owner_email, status")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) return { ok: false, error: "Studio claim not found", httpStatus: 404 };
  if (claim.status !== "verified") {
    return { ok: false, error: `Claim is already ${claim.status}`, httpStatus: 409 };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("claims")
    .update({ status: "approved" })
    .eq("id", claimId);
  if (updateErr) return { ok: false, error: updateErr.message, httpStatus: 500 };

  const listingUrl   = `${SITE_URL}/studios/${claim.studio_slug}`;
  const dashboardUrl = `${SITE_URL}/dashboard`;
  const firstName    = claim.owner_name.split(" ")[0];

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      claim.owner_email,
      subject: `Your listing for ${claim.studio_title} is approved`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
<tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
  <tr>
    <td style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
      <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Ballroom Dance Directory</p>
      <h1 style="color:#fff;font-size:26px;font-weight:300;margin:0;line-height:1.3;">Your listing is approved. ✓</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:10px 0 0;">You're now a verified owner on the directory.</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:40px 40px 32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
        We've reviewed your claim for <strong>${claim.studio_title}</strong> and your listing is now
        officially approved on the Ballroom Dance Directory. Your profile is live and verified.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border:1.5px solid #e8c560;border-radius:12px;margin-bottom:28px;">
        <tr><td style="padding:24px 28px;">
          <p style="color:#374151;font-size:14px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px;">What you can do now</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="28" valign="top" style="padding-right:12px;padding-bottom:12px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#b8922a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">1</div>
              </td>
              <td style="padding-bottom:12px;">
                <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Log in to your dashboard</p>
                <p style="color:#6b7280;font-size:13px;margin:0;">Manage your studio profile, update your description, and add social links.</p>
              </td>
            </tr>
            <tr>
              <td width="28" valign="top" style="padding-right:12px;padding-bottom:12px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#b8922a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">2</div>
              </td>
              <td style="padding-bottom:12px;">
                <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">View your live listing</p>
                <p style="color:#6b7280;font-size:13px;margin:0;">See how your studio appears to dancers searching the directory.</p>
              </td>
            </tr>
            <tr>
              <td width="28" valign="top" style="padding-right:12px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:12px;font-weight:700;text-align:center;line-height:24px;">3</div>
              </td>
              <td>
                <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Consider upgrading to Featured</p>
                <p style="color:#6b7280;font-size:13px;margin:0;">Stand out with a Featured badge, photo gallery, and priority ranking — $49/month.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding-right:8px;">
            <a href="${dashboardUrl}" style="display:block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;">Go to Dashboard →</a>
          </td>
          <td style="padding-left:8px;">
            <a href="${listingUrl}" style="display:block;background:#f9fafb;color:#374151;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;border:1.5px solid #e5e7eb;">View Your Listing →</a>
          </td>
        </tr>
      </table>
      <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Ballroom Dance Directory Team</p>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">Ballroom Dance Directory · <a href="${SITE_URL}" style="color:#9ca3af;">www.ballroomdancedirectory.com</a></p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    });
  } catch (emailErr) {
    console.warn("[kitt/action] studio approve email error:", emailErr);
  }

  const { data: updated } = await supabaseAdmin.from("claims").select("*").eq("id", claimId).single();
  return { ok: true, claim: updated, message: `Studio claim approved — approval email sent to ${claim.owner_email}` };
}

// ── Studio: reject ────────────────────────────────────────────────────────────

async function studioReject(claimId: string, reason?: string): Promise<ActionResult> {
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_title, studio_slug, owner_name, owner_email, status")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) return { ok: false, error: "Studio claim not found", httpStatus: 404 };
  if (claim.status !== "verified") {
    return { ok: false, error: `Claim is already ${claim.status}`, httpStatus: 409 };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("claims")
    .update({ status: "rejected" })
    .eq("id", claimId);
  if (updateErr) return { ok: false, error: updateErr.message, httpStatus: 500 };

  const listingUrl  = `${SITE_URL}/studios/${claim.studio_slug}`;
  const contactUrl  = `${SITE_URL}/contact`;
  const firstName   = claim.owner_name.split(" ")[0];
  const reasonHtml  = reason
    ? `<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">Reason: <em>${reason}</em></p>`
    : "";

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      claim.owner_email,
      subject: `Regarding your listing claim for ${claim.studio_title}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
<tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
  <tr>
    <td style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
      <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Ballroom Dance Directory</p>
      <h1 style="color:#fff;font-size:24px;font-weight:300;margin:0;line-height:1.3;">Update on your listing claim</h1>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:40px 40px 32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Thank you for submitting a claim for <strong>${claim.studio_title}</strong> on
        the Ballroom Dance Directory. After reviewing your submission, we were unable to
        verify ownership at this time.
      </p>
      ${reasonHtml}
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your free listing for ${claim.studio_title} remains active and visible to dancers
        searching the directory. If you believe this decision was made in error, or if
        you can provide additional information to verify your ownership, please reach out
        to us directly — we're happy to take another look.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding-right:8px;">
            <a href="${contactUrl}" style="display:block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;">Contact Us →</a>
          </td>
          <td style="padding-left:8px;">
            <a href="${listingUrl}" style="display:block;background:#f9fafb;color:#374151;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;border:1.5px solid #e5e7eb;">View Your Listing →</a>
          </td>
        </tr>
      </table>
      <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Ballroom Dance Directory Team</p>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">Ballroom Dance Directory · <a href="${SITE_URL}" style="color:#9ca3af;">www.ballroomdancedirectory.com</a></p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    });
  } catch (emailErr) {
    console.warn("[kitt/action] studio reject email error:", emailErr);
  }

  const { data: updated } = await supabaseAdmin.from("claims").select("*").eq("id", claimId).single();
  return { ok: true, claim: updated, message: `Studio claim rejected — rejection email sent to ${claim.owner_email}` };
}

// ── Studio: make_featured ─────────────────────────────────────────────────────

async function studioMakeFeatured(claimId: string): Promise<ActionResult> {
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_slug, studio_title, tier, status")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) return { ok: false, error: "Studio claim not found", httpStatus: 404 };
  if (claim.status !== "approved") {
    return { ok: false, error: "Claim must be approved before upgrading to Featured", httpStatus: 409 };
  }
  if (claim.tier === "paid") {
    return { ok: false, error: "Studio is already on the Featured tier", httpStatus: 409 };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("claims")
    .update({ tier: "paid" })
    .eq("id", claimId);
  if (updateErr) return { ok: false, error: updateErr.message, httpStatus: 500 };

  // Sync WP ACF (non-fatal)
  await updateWpTier(claim.studio_slug, "paid");

  const { data: updated } = await supabaseAdmin.from("claims").select("*").eq("id", claimId).single();
  return { ok: true, claim: updated, message: `${claim.studio_title} upgraded to Featured tier (WP ACF synced)` };
}

// ── Studio: push_ghl ──────────────────────────────────────────────────────────

async function studioPushGhl(claimId: string): Promise<ActionResult> {
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_slug, studio_title, owner_name, owner_email, owner_phone, tier, status")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) return { ok: false, error: "Studio claim not found", httpStatus: 404 };
  if (claim.status !== "approved") {
    return { ok: false, error: "Claim must be approved before pushing to GHL", httpStatus: 409 };
  }

  const listingUrl  = `${SITE_URL}/studios/${claim.studio_slug}`;
  const [firstName, ...rest] = (claim.owner_name ?? "Studio Owner").split(" ");
  const lastName    = rest.join(" ") || "Owner";
  const tag         = claim.tier === "paid" ? "bdd-featured" : "bdd-claimed";
  const stageId     = claim.tier === "paid" ? STAGE_FEATURED_ID : STAGE_CLAIMED_ID;
  const stageName   = claim.tier === "paid" ? "Featured (Paid)" : "Claimed";

  try {
    // 1. Upsert GHL contact
    let contactId: string;
    const searchRes = await ghl<any>(
      "GET",
      `/contacts/?locationId=${LOCATION_ID}&query=${encodeURIComponent(claim.owner_email)}`
    );
    const existing = (searchRes?.contacts ?? []).find(
      (c: any) => c.email?.toLowerCase() === claim.owner_email.toLowerCase()
    );

    if (existing) {
      contactId = existing.id;
      await ghl("PUT", `/contacts/${contactId}`, {
        firstName, lastName,
        phone: claim.owner_phone ?? "",
        tags: [tag, "ballroom-dance-directory"],
        customFields: [
          { key: "studio_name", field_value: claim.studio_title },
          { key: "studio_slug", field_value: claim.studio_slug  },
          { key: "listing_url", field_value: listingUrl         },
          { key: "claim_id",    field_value: claimId            },
          { key: "studio_tier", field_value: claim.tier         },
        ],
      });
    } else {
      const createRes = await ghl<any>("POST", `/contacts/`, {
        locationId: LOCATION_ID,
        firstName, lastName,
        email: claim.owner_email,
        phone: claim.owner_phone ?? "",
        source: "Ballroom Dance Directory",
        tags: [tag, "ballroom-dance-directory"],
        customFields: [
          { key: "studio_name", field_value: claim.studio_title },
          { key: "studio_slug", field_value: claim.studio_slug  },
          { key: "listing_url", field_value: listingUrl         },
          { key: "claim_id",    field_value: claimId            },
          { key: "studio_tier", field_value: claim.tier         },
        ],
      });
      contactId = createRes?.contact?.id;
    }

    if (!contactId) throw new Error("Failed to get GHL contact ID");

    // 2. Create opportunity
    const oppRes = await ghl<any>("POST", `/opportunities/`, {
      pipelineId:      PIPELINE_ID,
      pipelineStageId: stageId,
      locationId:      LOCATION_ID,
      contactId,
      name:            `${claim.studio_title} — ${claim.tier === "paid" ? "Featured" : "Claimed (Free)"}`,
      status:          claim.tier === "paid" ? "won" : "open",
      monetaryValue:   claim.tier === "paid" ? 49 : 0,
      customFields: [
        { key: "listing_url", field_value: listingUrl },
        { key: "claim_id",    field_value: claimId    },
      ],
    });

    const { data: updated } = await supabaseAdmin.from("claims").select("*").eq("id", claimId).single();
    return {
      ok:      true,
      claim:   updated,
      message: `Pushed to GHL — Studio Owner Pipeline → ${stageName} (contact: ${contactId}, opp: ${oppRes?.opportunity?.id ?? "n/a"})`,
    };
  } catch (err: any) {
    return { ok: false, error: `GHL push failed: ${err.message}`, httpStatus: 500 };
  }
}

// ── Competition: approve ──────────────────────────────────────────────────────

async function competitionApprove(claimId: string): Promise<ActionResult> {
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("competition_claims")
    .select("id, competition_name, competition_slug, organizer_name, organizer_email, status")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) return { ok: false, error: "Competition claim not found", httpStatus: 404 };
  if (claim.status !== "verified") {
    return { ok: false, error: `Claim is already ${claim.status}`, httpStatus: 409 };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("competition_claims")
    .update({ status: "approved" })
    .eq("id", claimId);
  if (updateErr) return { ok: false, error: updateErr.message, httpStatus: 500 };

  const compUrl   = `${SITE_URL}/competitions/${claim.competition_slug}`;
  const firstName = claim.organizer_name.split(" ")[0];

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      claim.organizer_email,
      subject: `Your listing for ${claim.competition_name} is approved`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
<tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
  <tr>
    <td style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
      <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Ballroom Dance Directory</p>
      <h1 style="color:#fff;font-size:26px;font-weight:300;margin:0;line-height:1.3;">Your competition listing is approved. ✓</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:10px 0 0;">You're now a verified organizer on the directory.</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:40px 40px 32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
        We've reviewed your claim for <strong>${claim.competition_name}</strong> and your competition listing is now
        officially approved on the Ballroom Dance Directory. Your profile is live and verified.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td>
            <a href="${compUrl}" style="display:block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;">View Your Listing →</a>
          </td>
        </tr>
      </table>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">Questions? Just reply to this email — it comes straight to us.</p>
      <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Ballroom Dance Directory Team</p>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">Ballroom Dance Directory · <a href="${SITE_URL}" style="color:#9ca3af;">www.ballroomdancedirectory.com</a></p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    });
  } catch (emailErr) {
    console.warn("[kitt/action] competition approve email error:", emailErr);
  }

  const { data: updated } = await supabaseAdmin.from("competition_claims").select("*").eq("id", claimId).single();
  return { ok: true, claim: updated, message: `Competition claim approved — approval email sent to ${claim.organizer_email}` };
}

// ── Competition: reject ───────────────────────────────────────────────────────

async function competitionReject(claimId: string, reason?: string): Promise<ActionResult> {
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("competition_claims")
    .select("id, competition_name, competition_slug, organizer_name, organizer_email, status")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) return { ok: false, error: "Competition claim not found", httpStatus: 404 };
  if (claim.status !== "verified") {
    return { ok: false, error: `Claim is already ${claim.status}`, httpStatus: 409 };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("competition_claims")
    .update({ status: "rejected" })
    .eq("id", claimId);
  if (updateErr) return { ok: false, error: updateErr.message, httpStatus: 500 };

  const compUrl    = `${SITE_URL}/competitions/${claim.competition_slug}`;
  const contactUrl = `${SITE_URL}/contact`;
  const firstName  = claim.organizer_name.split(" ")[0];
  const reasonHtml = reason
    ? `<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">Reason: <em>${reason}</em></p>`
    : "";

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      claim.organizer_email,
      subject: `Regarding your listing claim for ${claim.competition_name}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
<tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
  <tr>
    <td style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
      <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Ballroom Dance Directory</p>
      <h1 style="color:#fff;font-size:24px;font-weight:300;margin:0;line-height:1.3;">Update on your listing claim</h1>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:40px 40px 32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Thank you for submitting a claim for <strong>${claim.competition_name}</strong> on
        the Ballroom Dance Directory. After reviewing your submission, we were unable to
        verify ownership at this time.
      </p>
      ${reasonHtml}
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your competition listing remains active and visible to dancers searching the directory.
        If you believe this decision was made in error, or you can provide additional information,
        please reach out — we're happy to take another look.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding-right:8px;">
            <a href="${contactUrl}" style="display:block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;">Contact Us →</a>
          </td>
          <td style="padding-left:8px;">
            <a href="${compUrl}" style="display:block;background:#f9fafb;color:#374151;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;border:1.5px solid #e5e7eb;">View Your Listing →</a>
          </td>
        </tr>
      </table>
      <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Ballroom Dance Directory Team</p>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">Ballroom Dance Directory · <a href="${SITE_URL}" style="color:#9ca3af;">www.ballroomdancedirectory.com</a></p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    });
  } catch (emailErr) {
    console.warn("[kitt/action] competition reject email error:", emailErr);
  }

  const { data: updated } = await supabaseAdmin.from("competition_claims").select("*").eq("id", claimId).single();
  return { ok: true, claim: updated, message: `Competition claim rejected — rejection email sent to ${claim.organizer_email}` };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { claim_type?: string; claim_id?: string; action?: string; params?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { claim_type, claim_id, action, params = {} } = body;

  if (!claim_type || !claim_id || !action) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields: claim_type, claim_id, action" },
      { status: 400 }
    );
  }

  // ── Studio ─────────────────────────────────────────────────────────────────
  if (claim_type === "studio") {
    let result: ActionResult;
    switch (action) {
      case "approve":
        result = await studioApprove(claim_id);
        break;
      case "reject":
        result = await studioReject(claim_id, params.reason);
        break;
      case "make_featured":
        result = await studioMakeFeatured(claim_id);
        break;
      case "push_ghl":
        result = await studioPushGhl(claim_id);
        break;
      default:
        return NextResponse.json(
          { ok: false, error: `Unknown studio action: "${action}". Valid: approve, reject, make_featured, push_ghl` },
          { status: 400 }
        );
    }
    return result.ok
      ? NextResponse.json(result)
      : NextResponse.json(result, { status: result.httpStatus });
  }

  // ── Competition ────────────────────────────────────────────────────────────
  if (claim_type === "competition") {
    let result: ActionResult;
    switch (action) {
      case "approve":
        result = await competitionApprove(claim_id);
        break;
      case "reject":
        result = await competitionReject(claim_id, params.reason);
        break;
      default:
        return NextResponse.json(
          { ok: false, error: `Unknown competition action: "${action}". Valid: approve, reject` },
          { status: 400 }
        );
    }
    return result.ok
      ? NextResponse.json(result)
      : NextResponse.json(result, { status: result.httpStatus });
  }

  return NextResponse.json(
    { ok: false, error: `Unknown claim_type: "${claim_type}". Valid: studio, competition` },
    { status: 400 }
  );
}
