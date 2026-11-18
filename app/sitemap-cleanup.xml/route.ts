import { getAllStudios, getStudiosByCity, METRO_ALIASES } from "@/lib/wordpress";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DANCE_BOOKING_RANK } from "@/lib/dancebookingrank";
import { COMP_REGION_LABELS, COMP_STYLE_LABELS } from "@/types/competition";
import { DANCE_STYLES } from "@/types/studio";

// ─── /sitemap-cleanup.xml — TEMPORARY (Nov 2026) ──────────────────────────────
// Lists pages we now keep out of Google's index (noindex for all crawlers, or
// googlebot-only noindex for unverified studios) so Googlebot recrawls them
// sooner and processes the noindex. Google only drops a page after it re-reads
// it; on Nov 17, 10 of 18 sampled studio pages were still indexed from crawls
// made before the Oct 28 change.
//
// Submitted separately in Search Console; NOT referenced from robots.txt or the
// main sitemap. Remove this route (and the Search Console submission) once
// Page indexing shows these URLs as "Excluded by 'noindex' tag" — expected
// Jan 2027. Never list a URL here that we want indexed.

export const revalidate = 86400;

const BASE_URL = "https://www.ballroomdancedirectory.com";

// Every studio page's content changed on this date (listing status card and the
// online booking/payment check went live on all listings), so it is a true lastmod.
const STUDIO_LASTMOD = "2026-11-09";

// The 20 metro hubs that stay indexable (same list as app/sitemap.ts).
const INDEXED_HUBS = new Set([
  "los-angeles", "new-york-city", "chicago", "houston", "dallas",
  "miami", "phoenix", "atlanta", "seattle", "denver",
  "las-vegas", "boston", "san-diego", "austin", "tampa",
  "nashville", "orlando", "portland", "san-antonio", "minneapolis",
]);
const MIN_STUDIOS_TO_INDEX_HUB = 5;      // matches app/studios/city/[city]/page.tsx
const MIN_STUDIOS_FOR_CITY_STYLE = 2;    // matches app/sitemap.ts (fewer redirect or were never listed)

async function getVerifiedClaimSlugs(): Promise<Set<string>> {
  try {
    const { data } = await supabaseAdmin
      .from("claims")
      .select("studio_slug")
      .in("status", ["verified", "approved"]);
    return new Set(((data || []) as { studio_slug: string | null }[]).map((r) => r.studio_slug || "").filter(Boolean));
  } catch {
    return new Set();
  }
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const [studios, claimSlugs] = await Promise.all([getAllStudios(100), getVerifiedClaimSlugs()]);

  const urls: { loc: string; lastmod?: string }[] = [];

  // 1. Unverified studio pages (verified ones are indexable and live in /sitemap.xml).
  for (const s of studios) {
    const verified = s.tier === "claimed" || s.tier === "paid" || claimSlugs.has(s.slug);
    if (!verified) urls.push({ loc: `${BASE_URL}/studios/${s.slug}`, lastmod: STUDIO_LASTMOD });
  }

  // 2. Thin city hubs (fewer than 5 studios → noindex). Counted from the list we
  //    already have (same slug rule as getAllCities); calling getStudiosByCity per
  //    city would refetch the whole catalog ~900 times. Metro hubs are skipped.
  const nameCounts = new Map<string, number>();
  for (const s of studios) {
    if (!s.city) continue;
    const slug = s.city.toLowerCase().replace(/\s+/g, "-");
    nameCounts.set(slug, (nameCounts.get(slug) ?? 0) + 1);
  }
  for (const [slug, n] of nameCounts) {
    if (INDEXED_HUBS.has(slug) || METRO_ALIASES[slug]) continue;
    if (n < MIN_STUDIOS_TO_INDEX_HUB) urls.push({ loc: `${BASE_URL}/studios/city/${encodeURI(slug)}` });
  }

  // 3. City × style pages that used to be in the sitemap (now noindexed).
  for (const city of Array.from(INDEXED_HUBS)) {
    const metro = await getStudiosByCity(city); // sequential: each call reads the whole catalog
    for (const style of DANCE_STYLES) {
      const n = metro.filter((s) => s.danceStyles.includes(style)).length;
      if (n >= MIN_STUDIOS_FOR_CITY_STYLE) {
        urls.push({ loc: `${BASE_URL}/studios/city/${city}/style/${style.replace(/_/g, "-")}` });
      }
    }
  }

  // 4. Other noindexed page types that used to be listed.
  for (const c of DANCE_BOOKING_RANK) urls.push({ loc: `${BASE_URL}/dancebookingrank/${c.slug}/seo-details` });
  for (const r of Object.keys(COMP_REGION_LABELS)) urls.push({ loc: `${BASE_URL}/competitions/region/${r}` });
  for (const st of Object.keys(COMP_STYLE_LABELS)) urls.push({ loc: `${BASE_URL}/competitions/style/${st}` });
  urls.push({ loc: `${BASE_URL}/dance-lessons-near-me` });

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `<url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
