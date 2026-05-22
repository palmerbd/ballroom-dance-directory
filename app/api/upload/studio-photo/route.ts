// ─── POST /api/upload/studio-photo ───────────────────────────────────────────
// Accepts a multipart/form-data upload from a verified/approved paid-tier
// studio owner and stores the image in Supabase Storage (bucket: studio-photos).
// Also writes a record to the studio_photos table so the gallery can fetch them.
//
// Request: multipart/form-data
//   file      – the image file (jpg/png/webp, max 5 MB)
//   claim_id  – the owner's claim ID (used for auth check + row insertion)
//
// Returns: { url, id } on success

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_BYTES    = 5 * 1024 * 1024; // 5 MB
const BUCKET       = "studio-photos";
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file     = form.get("file")     as File   | null;
    const claimId  = form.get("claim_id") as string | null;

    if (!file || !claimId) {
      return NextResponse.json({ error: "Missing file or claim_id" }, { status: 400 });
    }

    // ── Validate file ──────────────────────────────────────────────────────────
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP and GIF images are accepted" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
    }

    // ── Verify claim is paid + get studio_slug ────────────────────────────────
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from("claims")
      .select("id, studio_slug, tier, status")
      .eq("id", claimId)
      .in("status", ["verified", "approved"])
      .maybeSingle();

    if (claimErr || !claim) {
      return NextResponse.json({ error: "Claim not found or not eligible" }, { status: 404 });
    }

    if (claim.tier !== "paid") {
      return NextResponse.json(
        { error: "Photo uploads are only available on the Featured plan" },
        { status: 403 },
      );
    }

    // ── How many photos does this studio already have? ────────────────────────
    const { count } = await supabaseAdmin
      .from("studio_photos")
      .select("id", { count: "exact", head: true })
      .eq("claim_id", claimId);

    if ((count ?? 0) >= 6) {
      return NextResponse.json(
        { error: "Maximum of 6 photos per studio. Delete one to upload more." },
        { status: 409 },
      );
    }

    // ── Upload to Supabase Storage ─────────────────────────────────────────────
    const ext      = file.name.split(".").pop() || "jpg";
    const filename = `${claim.studio_slug}/${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType:  file.type,
        cacheControl: "3600",
        upsert:       false,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // ── Get the public URL ─────────────────────────────────────────────────────
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    // ── Insert into studio_photos table ───────────────────────────────────────
    const { data: photo, error: insertErr } = await supabaseAdmin
      .from("studio_photos")
      .insert({
        claim_id:    claimId,
        studio_slug: claim.studio_slug,
        url:         publicUrl,
        storage_path: filename,
      })
      .select("id, url")
      .single();

    if (insertErr) {
      console.error("DB insert error:", insertErr);
      // Clean up the uploaded file if DB insert fails
      await supabaseAdmin.storage.from(BUCKET).remove([filename]);
      return NextResponse.json({ error: "Failed to save photo record" }, { status: 500 });
    }

    return NextResponse.json({ id: photo.id, url: photo.url }, { status: 201 });

  } catch (err) {
    console.error("POST /api/upload/studio-photo error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/upload/studio-photo ──────────────────────────────────────────
// Removes a photo from both Storage and the studio_photos table.
// Request body: { photo_id, claim_id }

export async function DELETE(req: NextRequest) {
  try {
    const { photo_id, claim_id } = await req.json();

    if (!photo_id || !claim_id) {
      return NextResponse.json({ error: "Missing photo_id or claim_id" }, { status: 400 });
    }

    // Fetch the photo, verifying ownership via claim_id
    const { data: photo, error } = await supabaseAdmin
      .from("studio_photos")
      .select("id, storage_path, claim_id")
      .eq("id", photo_id)
      .eq("claim_id", claim_id)
      .maybeSingle();

    if (error || !photo) {
      return NextResponse.json({ error: "Photo not found or not yours" }, { status: 404 });
    }

    // Delete from Storage
    await supabaseAdmin.storage.from(BUCKET).remove([photo.storage_path]);

    // Delete from DB
    await supabaseAdmin.from("studio_photos").delete().eq("id", photo_id);

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("DELETE /api/upload/studio-photo error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
