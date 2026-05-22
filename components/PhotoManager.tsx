"use client";

// ─── PhotoManager ─────────────────────────────────────────────────────────────
// Dashboard card for Featured (paid-tier) studio owners to upload and manage
// gallery photos. Allows up to 6 photos; photos replace Unsplash placeholders
// on the studio detail page.
//
// Props:
//   claimId    – the owner's claim ID (used for auth + upload)
//   studioSlug – used to trigger ISR revalidation after changes

import { useEffect, useRef, useState } from "react";

interface StudioPhoto {
  id:  string;
  url: string;
}

export default function PhotoManager({
  claimId,
  studioSlug,
}: {
  claimId:    string;
  studioSlug: string;
}) {
  const [photos,    setPhotos]    = useState<StudioPhoto[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load existing photos ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res  = await fetch(`/api/studios/${studioSlug}/photos`);
        const data = await res.json();
        if (data.photos) setPhotos(data.photos);
      } catch {
        // Non-fatal — gallery just shows empty state
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, [studioSlug]);

  // ── Upload handler ────────────────────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 6) {
      setError("You already have 6 photos. Delete one to upload more.");
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file",     file);
      body.append("claim_id", claimId);

      const res  = await fetch("/api/upload/studio-photo", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed. Please try again.");
        return;
      }

      setPhotos((prev) => [...prev, { id: data.id, url: data.url }]);
      setSuccess("Photo uploaded! It may take a few minutes to appear on your listing.");

      // Trigger ISR revalidation so the studio page picks up the new photo
      await fetch(`/api/revalidate?slug=${studioSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Delete handler ────────────────────────────────────────────────────────
  async function handleDelete(photoId: string) {
    if (!confirm("Remove this photo from your gallery?")) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/upload/studio-photo", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ photo_id: photoId, claim_id: claimId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Delete failed. Please try again.");
        return;
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSuccess("Photo removed.");
      await fetch(`/api/revalidate?slug=${studioSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900 text-lg">Gallery Photos</h3>
        <span className="text-xs text-gray-400">{photos.length}/6 photos</span>
      </div>
      <p className="text-gray-500 text-sm mb-5">
        Upload up to 6 photos to showcase your studio. These replace the stock
        images on your listing page.
      </p>

      {/* Feedback messages */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">
          {success}
        </div>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt="Studio photo"
                className="w-full h-full object-cover"
              />
              {/* Delete overlay */}
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute inset-0 flex items-center justify-center
                           bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                           text-white text-xs font-bold"
              >
                ✕ Remove
              </button>
            </div>
          ))}

          {/* Upload slot — only shown if under the 6-photo limit */}
          {photos.length < 6 && (
            <label
              className={`aspect-square rounded-xl border-2 border-dashed
                          flex flex-col items-center justify-center cursor-pointer
                          transition-colors
                          ${uploading
                            ? "border-gray-200 bg-gray-50 pointer-events-none"
                            : "border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                          }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleUpload}
                disabled={uploading}
              />
              {uploading ? (
                <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
              ) : (
                <>
                  <span className="text-2xl text-yellow-500 mb-1">+</span>
                  <span className="text-xs text-yellow-700 font-semibold text-center px-2">
                    Add photo
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG · PNG · WebP</span>
                </>
              )}
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Max 5 MB per photo. Changes appear on your listing within a few minutes.
      </p>
    </div>
  );
}
