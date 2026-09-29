import { MetadataRoute } from "next";
import { getAllStudios, getBlogSlugs, getStudiosByCity } from "@/lib/wordpress";
import { COMPETITIONS } from "@/lib/competitions-data";
import { COMP_REGION_LABELS, COMP_STYLE_LABELS } from "@/types/competition";
import { DANCE_STYLES } from "@/types/studio";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";
const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "http://5.78.218.239/wp-json";

const CITIES = [
  "los-angeles", "new-york-city", "chicago", "houston", "dallas",
  "miami", "phoenix", "atlanta", "seattle", "denver",
  "las-vegas", "boston", "san-diego", "austin", "tampa",
  "nashville", "orlando", "portland", "san-antonio", "minneapolis",
];

// City × style pages with fewer than this many studios are noindexed (1 studio)
// or redirect to the city page (0 studios) — see app/studios/city/[city]/style/[style]/page.tsx.
// Listing those URLs here sends Google contradictory signals, so skip them.
const MIN_STUDIOS_FOR_CITY_STYLE = 2;

/**
 * Real last-modified dates for studios, straight from WordPress (slug -> Date).
 * Previously every URL claimed lastModified = "now", which teaches Google to ignore
 * our lastmod entirely. Accurate dates let Google prioritise recrawling the studios
 * whose content actually changed (e.g. the Sept 2026 description/tagline rewrites).
 * Fails soft: on any error returns an empty map and entries simply omit lastmod.
 */
async function getStudioModifiedDates(): Promise<Map<string, Date>> {
  const map = new Map<string, Date>();
  try {
    const pageUrl = (page: number) =>
      `${WP_API_URL}/wp/v2/dance_studio?_fields=slug,modified_gmt&status=publish&per_page=100&page=${page}`;

    const res1 = await fetch(pageUrl(1), { next: { revalidate: 7200 } });
    if (!res1.ok) return map;
    const totalPages = Number(res1.headers.get("X-WP-TotalPages") || "1");
    const rows: { slug: string; modified_gmt: string }[] = [...(await res1.json())];

    // Bounded concurrency (6 in flight) — same rule as getAllStudios, to spare the WP VPS.
    let next = 2;
    const worker = async () => {
      while (next <= totalPages) {
        const page = next++;
        const r = await fetch(pageUrl(page), { next: { revalidate: 7200 } });
        if (r.ok) rows.push(...((await r.json()) as { slug: string; modified_gmt: string }[]));
      }
    };
    await Promise.all(Array.from({ length: Math.min(6, Math.max(0, totalPages - 1)) }, worker));

    for (const row of rows) {
      if (!row.slug || !row.modified_gmt) continue;
      const d = new Date(`${row.modified_gmt}Z`);
      if (!Number.isNaN(d.getTime())) map.set(row.slug, d);
    }
  } catch {
    // fall through with whatever we have
  }
  return map;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [studios, blogSlugs, modifiedDates] = await Promise.all([
    getAllStudios(),
    getBlogSlugs(),
    getStudioModifiedDates(),
  ]);

  const studioEntries: MetadataRoute.Sitemap = studios.map((studio) => {
    const lastModified = modifiedDates.get(studio.slug);
    return {
      url: `${BASE_URL}/studios/${studio.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  const cityEntries: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE_URL}/studios/city/${city}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // City × Style intersection pages — only combos with enough studios to be
  // indexable (see MIN_STUDIOS_FOR_CITY_STYLE above).
  const cityStudioLists = await Promise.all(CITIES.map((city) => getStudiosByCity(city)));
  const cityStyleEntries: MetadataRoute.Sitemap = CITIES.flatMap((city, i) =>
    DANCE_STYLES.filter(
      (style) =>
        cityStudioLists[i].filter((s) => s.danceStyles.includes(style)).length >=
        MIN_STUDIOS_FOR_CITY_STYLE
    ).map((style) => ({
      url: `${BASE_URL}/studios/city/${city}/style/${style.replace(/_/g, "-")}`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }))
  );

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // ── Competition routes ──────────────────────────────────────────────────────
  const competitionEntries: MetadataRoute.Sitemap = COMPETITIONS.map((c) => ({
    url: `${BASE_URL}/competitions/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const competitionRegionEntries: MetadataRoute.Sitemap = Object.keys(COMP_REGION_LABELS).map((r) => ({
    url: `${BASE_URL}/competitions/region/${r}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const competitionStyleEntries: MetadataRoute.Sitemap = Object.keys(COMP_STYLE_LABELS).map((s) => ({
    url: `${BASE_URL}/competitions/style/${s}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/studios`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/competitions`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/dance-lessons-near-me`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/cities`, changeFrequency: "weekly", priority: 0.85 },
  ];

  return [
    ...staticEntries,
    ...cityEntries,
    ...cityStyleEntries,
    ...studioEntries,
    ...blogEntries,
    ...competitionEntries,
    ...competitionRegionEntries,
    ...competitionStyleEntries,
  ];
}
