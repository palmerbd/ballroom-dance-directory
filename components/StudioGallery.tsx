// ─── StudioGallery ────────────────────────────────────────────────────────────────────────────────
// Displays a 3-photo gallery for a studio detail page.
// Uses curated Unsplash placeholders (free commercial license).
// When the studio has a WP featuredImage, it appears as the hero slot.
// All photos fall back gracefully to a branded gradient if the image fails.

import Image from "next/image";
import { getStudioPhotos, unsplashUrl, type UnsplashPhoto } from "@/lib/studio-photos";
import type { DanceStyle, StudioChain } from "@/types/studio";

// ── Sub-component: single photo slot ─────────────────────────────────────────────────────

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
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────────────────────────────

export default function StudioGallery({
  studioId,
  danceStyles,
  chain,
  featuredImageUrl,
}: {
  studioId:          number;
  danceStyles:       DanceStyle[];
  chain:             StudioChain;
  featuredImageUrl?: string;
}) {
  const photos = getStudioPhotos(studioId, danceStyles, chain);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 gap-2 h-64 sm:h-80">
        {featuredImageUrl ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1428] to-[#1a2d5a] col-span-1 row-span-1">
            <Image
              src={featuredImageUrl}
              alt={`${studioId} — studio photo`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
        ) : (
          <PhotoSlot
            photo={photos.hero}
            width={600}
            height={400}
            priority
            className="col-span-1 row-span-1"
          />
        )}
        <div className="flex flex-col gap-2">
          <PhotoSlot photo={photos.left}  width={300} height={192} className="flex-1" />
          <PhotoSlot photo={photos.right} width={300} height={192} className="flex-1" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">
        Photos via{" "}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 transition-colors">
          Unsplash
        </a>
        {" "}(free license) ·{" "}
        <span className="italic">
          Studio owners can{" "}
          <a href="/claim" className="underline hover:text-gray-600">upload their own photos</a>
        </span>
      </p>
    </section>
  );
}
