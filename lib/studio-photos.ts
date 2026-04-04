// ─── Studio Photo Placeholder System ─────────────────────────────────────────────────────
// Curated Unsplash photo IDs organised by dance category.
// All photos are free to use under the Unsplash License:
//   https://unsplash.com/license
// Attribution links are embedded in the StudioGallery component.

import type { DanceStyle, StudioChain } from "@/types/studio";

export interface UnsplashPhoto {
  id:          string;
  alt:         string;
  authorName:  string;
  authorUrl:   string;
}

export interface StudioPhotoSet {
  hero:   UnsplashPhoto;
  left:   UnsplashPhoto;
  right:  UnsplashPhoto;
}

const BALLROOM_PHOTOS: UnsplashPhoto[] = [
  { id: "1518611012118-696072aa579a", alt: "Elegant couple performing a ballroom dance", authorName: "Ardian Lumi", authorUrl: "https://unsplash.com/@ardianlumi" },
  { id: "1547153760-18fc86324498",   alt: "Couple dancing in close embrace",            authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1516450939756-7baaeb3e0e46",alt: "Dancers silhouetted against warm light",     authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1504609813442-a8924e83f76e",alt: "Ballroom dance competition on stage",        authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
];

const LATIN_PHOTOS: UnsplashPhoto[] = [
  { id: "1612444894087-c4a9e7c56fdb", alt: "Latin dance couple in vibrant performance", authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1547226991-3c9e08e02e44",    alt: "Energetic salsa dancers in motion",         authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1500462918357-ac4dde89a80c", alt: "Couple dancing Latin style",                authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1558618666-fcd25c85cd64",    alt: "Passionate tango embrace",                  authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
];

const TANGO_PHOTOS: UnsplashPhoto[] = [
  { id: "1547153760-18fc86324498",    alt: "Argentine tango close embrace",             authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1558618666-fcd25c85cd64",    alt: "Tango dancers in elegant pose",             authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1518611012118-696072aa579a", alt: "Passionate tango performance",              authorName: "Ardian Lumi", authorUrl: "https://unsplash.com/@ardianlumi" },
  { id: "1516450939756-7baaeb3e0e46", alt: "Tango couple in dramatic lighting",         authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
];

const WEDDING_PHOTOS: UnsplashPhoto[] = [
  { id: "1519741497674-4f6036563c44", alt: "Couple sharing their first wedding dance",  authorName: "Photos by Lanty", authorUrl: "https://unsplash.com/@photos_by_lanty" },
  { id: "1465495976447-4e10fb69d481", alt: "Bride and groom dancing at reception",      authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1511285560929-80b5dd34f20b", alt: "Elegant wedding reception dance floor",     authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1518611012118-696072aa579a", alt: "Wedding dance in warm candlelight",         authorName: "Ardian Lumi", authorUrl: "https://unsplash.com/@ardianlumi" },
];

const SWING_PHOTOS: UnsplashPhoto[] = [
  { id: "1504609813442-a8924e83f76e", alt: "Swing dancers performing with energy",      authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1547226991-3c9e08e02e44",    alt: "Jive and swing dance in motion",            authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1516450939756-7baaeb3e0e46", alt: "Dancers enjoying swing music",              authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
];

const COMPETITION_PHOTOS: UnsplashPhoto[] = [
  { id: "1504609813442-a8924e83f76e", alt: "Competitive dancers on stage",              authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1547153760-18fc86324498",    alt: "Championship ballroom competition",         authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1612444894087-c4a9e7c56fdb", alt: "Dance competitors in elegant costumes",     authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1516450939756-7baaeb3e0e46", alt: "Ballroom competition showcase",             authorName: "Ahmad Odeh",  authorUrl: "https://unsplash.com/@aoddeh" },
];

const STUDIO_INTERIOR_PHOTOS: UnsplashPhoto[] = [
  { id: "1535525153412-5a42439a210b", alt: "Dance studio with hardwood floor and mirrors", authorName: "Ahmad Odeh", authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1508700929628-c4a11748db0e", alt: "Professional dance studio interior",           authorName: "Ahmad Odeh", authorUrl: "https://unsplash.com/@aoddeh" },
  { id: "1518611012118-696072aa579a", alt: "Spacious dance studio with warm lighting",     authorName: "Ardian Lumi",authorUrl: "https://unsplash.com/@ardianlumi" },
];

const STYLE_PHOTO_MAP: Partial<Record<DanceStyle, UnsplashPhoto[]>> = {
  ballroom:      BALLROOM_PHOTOS,
  waltz:         BALLROOM_PHOTOS,
  foxtrot:       BALLROOM_PHOTOS,
  latin:         LATIN_PHOTOS,
  salsa:         LATIN_PHOTOS,
  cha_cha:       LATIN_PHOTOS,
  rumba:         LATIN_PHOTOS,
  tango:         TANGO_PHOTOS,
  wedding_dance: WEDDING_PHOTOS,
  swing:         SWING_PHOTOS,
  competition:   COMPETITION_PHOTOS,
};

const CHAIN_PHOTO_MAP: Record<StudioChain, UnsplashPhoto[]> = {
  fred_astaire:  BALLROOM_PHOTOS,
  arthur_murray: BALLROOM_PHOTOS,
  dance_with_me: LATIN_PHOTOS,
  independent:   STUDIO_INTERIOR_PHOTOS,
};

function pick(pool: UnsplashPhoto[], studioId: number, offset = 0): UnsplashPhoto {
  return pool[(studioId + offset) % pool.length];
}

export function getStudioPhotos(
  studioId: number,
  danceStyles: DanceStyle[],
  chain: StudioChain,
): StudioPhotoSet {
  const primaryPool   = (danceStyles[0] && STYLE_PHOTO_MAP[danceStyles[0]]) || BALLROOM_PHOTOS;
  const secondaryPool = (danceStyles[1] && STYLE_PHOTO_MAP[danceStyles[1]]) || primaryPool;
  const accentPool    = CHAIN_PHOTO_MAP[chain];
  return {
    hero:  pick(primaryPool,   studioId, 0),
    left:  pick(secondaryPool, studioId, 1),
    right: pick(accentPool,    studioId, 2),
  };
}

export function unsplashUrl(photoId: string, width = 800, height = 500): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}
