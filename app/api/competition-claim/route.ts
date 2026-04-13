// ─── POST /api/competition-claim ──────────────────────────────────────────────
// Called by /competitions/claim/callback after Supabase magic link is verified.
// 1. Validates request body
// 2. Checks for duplicate claims (blocks re-claim)
// 3. Inserts into competition_claims (status: "verified")
// 4. Sends admin notification + organizer confirmation email via Resend
// 5. Returns { success: true, claim_id }
//
// Note: No WP REST API call needed — competitions are TypeScript seed data,
// not WP CPTs. Stage 3 will write organizer edits to competition_overrides.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";
const ADMIN_EMAIL = "bpalmer@abilenewebsitedesign.com";
const FROM_EMAIL  = "leads@ballroomdancedirectory.com";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      competition_slug,
      competition_name,
      organizer_name,
      organizer_email,
      organizer_phone,
      user_id,
    } = body;

    // ── Validate required fields ───────────────────────────────────────────
    if (!competition_slug || !organizer_name || !organizer_email || !user_id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // ── Check for duplicate claim ──────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("competition_claims")
      .select("id, status")
      .eq("competition_slug", competition_slug)
      .in("status", ["pending", "verified", "approved"])
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          code:    "already_claimed",
          message: "This competition listing has already been claimed.",
        },
        { status: 409 }
      );
    }

    // ── Insert claim into Supabase ─────────────────────────────────────────
    const { data: claim, error: insertError } = await supabaseAdmin
      .from("competition_claims")
      .insert({
        competition_slug,
        competition_name: competition_name || competition_slug,
        organizer_name,
        organizer_email,
        organizer_phone: organizer_phone || "",
        user_id,
        status: "verified", // email verified via magic link
        tier:   "free",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to record claim. Please try again." },
        { status: 500 }
      );
    }

    // ── Send emails via Resend (non-fatal) ─────────────────────────────────
    try {
      const compUrl = `${SITE_URL}/competitions/${competition_slug}`;

      // 1. Admin notification
      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      ADMIN_EMAIL,
        subject: `New competition claim: ${competition_name || competition_slug}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#0c1428;margin-bottom:4px">New Competition Claim Received</h2>
            <p style="color:#6b7280;margin-top:0">A competition organizer has verified their email and submitted a claim.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr>
                <td style="padding:8px 0;color:#374151;font-weight:600;width:160px">Competition</td>
                <td style="padding:8px 0;color:#111827">${competition_name || competition_slug}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#374151;font-weight:600">Organizer Name</td>
                <td style="padding:8px 0;color:#111827">${organizer_name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#374151;font-weight:600">Organizer Email</td>
                <td style="padding:8px 0;color:#111827">${organizer_email}</td>
              </tr>
              ${organizer_phone ? `
              <tr>
                <td style="padding:8px 0;color:#374151;font-weight:600">Phone</td>
                <td style="padding:8px 0;color:#111827">${organizer_phone}</td>
              </tr>` : ""}
              <tr>
                <td style="padding:8px 0;color:#374151;font-weight:600">Competition Page</td>
                <td style="padding:8px 0"><a href="${compUrl}" style="color:#1d4ed8">${compUrl}</a></td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px">
              Status: <strong>verified</strong>. Review in your Supabase dashboard.
            </p>
          </div>
        `,
      });

      // 2. Organizer confirmation
      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      organizer_email,
        subject: `We received your claim for ${competition_name || competition_slug}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px">
              <h1 style="color:#fff;font-size:22px;margin:0">Claim Received!</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0">Ballroom Dance Directory</p>
            </div>
            <p style="color:#374151">Hi ${organizer_name},</p>
            <p style="color:#374151">
              Thanks for claiming your listing for <strong>${competition_name || competition_slug}</strong>
              on the Ballroom Dance Directory. Your email has been verified — we're now reviewing your claim.
            </p>
            <div style="background:#eff6ff;border:1.5px solid #3b82f6;border-radius:12px;padding:16px;margin:20px 0">
              <p style="color:#374151;margin:0 0 4px;font-weight:600">What happens next?</p>
              <ul style="color:#6b7280;margin:8px 0 0;padding-left:20px;font-size:14px;line-height:1.7">
                <li>Our team reviews your claim (usually within 1 business day)</li>
                <li>You'll receive a follow-up email once your listing is approved</li>
                <li>After approval you can log in to update dates, venues, and registration links</li>
                <li>You can also upgrade to a Featured listing ($199/yr) for priority placement</li>
              </ul>
            </div>
            <p style="color:#374151">
              View your competition: <a href="${compUrl}" style="color:#1d4ed8">${compUrl}</a>
            </p>
            <p style="color:#374151;margin-top:24px">Best regards,<br>The Ballroom Dance Directory Team</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("Resend email error:", emailErr);
    }

    return NextResponse.json({ success: true, claim_id: claim.id });

  } catch (err) {
    console.error("POST /api/competition-claim error:", err);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
