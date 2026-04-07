// ─── StudioGallery ────────────────────────────────────────────────────────────
// Displays a 3-photo gallery for a studio detail page.
// Priority: real uploaded photos (studioPhotos[]) > WP featuredImage > Unsplash placeholders.
// All photos fall back gracefully to a branded gradient if the image fails.

import Image from "next/image";
import { getStudioPhotos, unsplashUrl, type UnsplashPhoto } from "@/lib/studio-photos";
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
        src={unsplashUrl(photo.id, width, height)}
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
      {hasUploaded ? (
        <p className="text-xs text-gray-400 mt-2 text-right italic">
          Photos provided by the studio owner
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-2 text-right">
          Photos via{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            Unsplash
          </a>
          {" "}(free license) ·{" "}
          <span className="italic">
            Studio owners can{" "}
            <a href="/dashboard" className="underline hover:text-gray-600">
              upload their own photos
            </a>
          </span>
        </p>
      )}
    </section>
  );
}
