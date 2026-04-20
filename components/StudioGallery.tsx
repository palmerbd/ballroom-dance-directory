// ─── StudioGallery ────────────────────────────────────────────────────────────
// Displays a 3-photo gallery for a studio detail page.
// Priority: real uploaded photos (studioPhotos[]) > WP featuredImage > Unsplash placeholders.
// All photos fall back gracefully to a branded gradient if the image fails.

import Image from "next/image";
import { getStudioPhotos, photoUrl, type UnsplashPhoto } from "@/lib/studio-photos";
import type { DanceStyle, StudioChain } from "@/types/studio";

// ── Sub-component: single photo slot ─────────────────────────────────────────

function PhotoSlot({
  photo,
  width,
  height,
  priority = false,
  className = "",
}: {
  photo:      UnsplashPhoto;
  width:      number;
  height:     number;
  priority?:  boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1428] to-[#1a2d5a] ${className}`}>
      <Image
        src={photoUrl(photo, width, height)}
        alt={photo.alt}
        fill
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        priority={priority}
        className="object-cover"
        // Graceful fallback handled by CSS bg gradient above
      />
      {/* Subtle gradient overlay so text is readable if we ever layer it */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface UploadedPhoto {
  id:  string;
  url: string;
}

export default function StudioGallery({
  studioId,
  danceStyles,
  chain,
  featuredImageUrl,
  studioPhotos = [],
}: {
  studioId:          number;
  danceStyles:       DanceStyle[];
  chain:             StudioChain;
  featuredImageUrl?: string;
  studioPhotos?:     UploadedPhoto[];
}) {
  const placeholders = getStudioPhotos(studioId, danceStyles, chain);
  const hasUploaded  = studioPhotos.length > 0;

  // ── Resolve the 3 display slots ───────────────────────────────────────────
  // Prefer uploaded photos in order; fall back to WP featured image then Unsplash.
  const heroUrl  = studioPhotos[0]?.url ?? featuredImageUrl ?? null;
  const leftUrl  = studioPhotos[1]?.url ?? null;
  const rightUrl = studioPhotos[2]?.url ?? null;

  // Helper: render a slot from a real URL or fall back to an Unsplash placeholder
  function RealOrPlaceholder({
    url,
    placeholder,
    alt,
    priority = false,
    className = "",
    width,
    height,
  }: {
    url:         string | null;
    placeholder: UnsplashPhoto;
    alt:         string;
    priority?:   boolean;
    className?:  string;
    width:       number;
    height:      number;
  }) {
    if (url) {
      return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1428] to-[#1a2d5a] ${className}`}>
          <Image
            src={url}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      );
    }
    return (
      <PhotoSlot
        photo={placeholder}
        width={width}
        height={height}
        priority={priority}
        className={className}
      />
    );
  }

  // ── No real photos yet — show upload prompt instead of demo images ───────
  const hasRealPhotos = hasUploaded || !!featuredImageUrl;

  if (!hasRealPhotos) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-center h-64 sm:h-80 rounded-xl bg-gradient-to-br from-[#0c1428] to-[#1a2d5a] border border-white/10">
          <div className="text-center px-6">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-white font-semibold text-lg mb-1">No photos uploaded yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Photos help potential students discover your studio.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors"
            >
              Upload Studio Photos →
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      {/* ── Grid: 1 hero + 2 smaller side-by-side ── */}
      <div className="grid grid-cols-2 gap-2 h-64 sm:h-80">

        {/* Hero — left half */}
        <RealOrPlaceholder
          url={heroUrl}
          placeholder={placeholders.hero}
          alt="Studio — main photo"
          priority
          className="col-span-1 row-span-1"
          width={600}
          height={400}
        />

        {/* Right column — 2 stacked */}
        <div className="flex flex-col gap-2">
          <RealOrPlaceholder
            url={leftUrl}
            placeholder={placeholders.left}
            alt="Studio — photo 2"
            className="flex-1"
            width={300}
            height={192}
          />
          <RealOrPlaceholder
            url={rightUrl}
            placeholder={placeholders.right}
            alt="Studio — photo 3"
            className="flex-1"
            width={300}
            height={192}
          />
        </div>
      </div>

      {/* ── Attribution ── */}
      <p className="text-xs text-gray-400 mt-2 text-right italic">
        Photos provided by the studio owner
      </p>
    </section>
  );
}
