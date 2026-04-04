// ─── WordPress Headless API Client ───────────────────────────────────────────
// Fetches data from WordPress REST API on the Hetzner server (5.78.144.42).
// ACF field names match the "Dance Studio Details" field group (imported 2026-03-30).

import { Studio, StudioCard, DanceStyle, StudioChain } from "@/types/studio";
import { supabaseAdmin } from "@/lib/supabase-admin";

const WP_API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://5.78.144.42/wp-json";

// ── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchWP<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${WP_API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`WP API ${res.status}: ${endpoint}`);
  return res.json() as T;
}

// ── Chain detection ───────────────────────────────────────────────────────────

function detectChain(title: string): StudioChain {
  const t = title.toLowerCase();
  if (t.includes("fred astaire"))  return "fred_astaire";
  if (t.includes("arthur murray")) return "arthur_murray";
  if (t.includes("dance with me")) return "dance_with_me";
  return "independent";
}

// ── ACF dance style → our DanceStyle union ───────────────────────────────────

const STYLE_MAP: Record<string, DanceStyle> = {
  ballroom:    "ballroom",
  latin:       "latin",
  swing:       "swing",
  wedding:     "wedding_dance",
  social:      "ballroom",
  competitive: "competition",
  salsa:       "salsa",
  tango:       "tango",
  waltz:       "waltz",
  foxtrot:     "foxtrot",
  // Note: cha_cha and rumba are not valid ACF checkbox values in WP
};

// ── Raw WP REST post → Studio ─────────────────────────────────────────────────

function mapWPPost(post: Record<string, unknown>): Studio {
  const acf   = (post.acf   as Record<string, unknown>) || {};
  const title = (post.title as Record<string, string>)?.rendered || "";

  const city  = (acf.studio_address_city  as string) || "";
  const state = (acf.studio_address_state as string) || "";

  const rawStyles  = (acf.studio_dance_styles as string[]) || [];
  const danceStyles: DanceStyle[] = [
    ...new Set(rawStyles.map((s) => STYLE_MAP[s]).filter(Boolean) as DanceStyle[]),
  ];

  const amenities = (acf.studio_amenities as string[]) || [];
  const priceDropin  = acf.studio_price_dropin  as number | undefined;
  const priceMonthly = acf.studio_price_monthly as number | undefined;
  const priceIntro   = acf.studio_price_intro   as number | undefined;

  return {
    id:                    post.id as number,
    slug:                  post.slug as string,
    title,
    description:
      (post.excerpt as Record<string, string>)?.rendered
        ?.replace(/<[^>]+>/g, "")
        .trim() || "",
    phone:                 (acf.studio_phone          as string) || "",
    address:               (acf.studio_address_street as string) || "",
    city,
    state,
    zip:                   (acf.studio_address_zip    as string) || "",
    website:               (acf.studio_website        as string) || undefined,
    email:                 (acf.studio_email          as string) || undefined,
    studioChain:           detectChain(title),
    danceStyles,
    privateLessonRate:     priceDropin  ? `$${priceDropin}/hr`  : undefined,
    introLessonRate:       priceIntro   ? `$${priceIntro}`      : undefined,
    monthlyRate:           priceMonthly ? `$${priceMonthly}/mo` : undefined,
    rating:                (acf.studio_rating        as number)  || undefined,
    reviewCount:           (acf.studio_review_count  as number)  || undefined,
    tagline:               (acf.studio_tagline       as string)  || undefined,
    foundedYear:           (acf.studio_founded_year  as number)  || undefined,
    yelpUrl:               (acf.studio_yelp_url        as string) || undefined,
    googleMapsUrl:         (acf.studio_google_maps_url as string) || undefined,
    facebookUrl:           (acf.studio_facebook_url    as string) || undefined,
    instagramUrl:          (acf.studio_instagram_url   as string) || undefined,
    amenities,
    hasParking:            amenities.includes("parking"),
    hasPrivateLessons:     amenities.includes("private_lessons"),
    hasGroupClasses:       amenities.includes("group_classes"),
    hasSprungFloor:        amenities.includes("sprung_floor"),
    competitionTraining:   danceStyles.includes("competition"),
    weddingDanceSpecialty: danceStyles.includes("wedding_dance"),
    medalProgram:          false,
    hours: {
      monday:    (acf.studio_hours_mon as string) || undefined,
      tuesday:   (acf.studio_hours_tue as string) || undefined,
      wednesday: (acf.studio_hours_wed as string) || undefined,
      thursday:  (acf.studio_hours_thu as string) || undefined,
      friday:    (acf.studio_hours_fri as string) || undefined,
      saturday:  (acf.studio_hours_sat as string) || undefined,
      sunday:    (acf.studio_hours_sun as string) || undefined,
    },
    featuredImage: undefined,
    claimed:       ["claimed", "paid"].includes((acf.studio_tier as string) || ""),
    tier:          (acf.studio_tier as string) || "free",
    cityState:     `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`,
  };
}

function toCard(s: Studio): StudioCard {
  return {
    id:               s.id,
    slug:             s.slug,
    title:            s.title,
    city:             s.city,
    state:            s.state,
    cityState:        s.cityState,
    studioChain:      s.studioChain,
    danceStyles:      s.danceStyles,
    featuredImage:    s.featuredImage,
    tier:             s.tier,
    description:      s.description,
    rating:           s.rating,
    reviewCount:      s.reviewCount,
    tagline:          s.tagline,
    phone:            s.phone,
    address:          s.address,
    privateLessonRate: s.privateLessonRate,
  };
}

// ── Shared REST params ────────────────────────────────────────────────────────

const FIELDS = "_fields=id,slug,title,excerpt,acf";

// ── Public API ────────────────────────────────────────────────────────────────

/** All published studios as lightweight cards — fetches all pages automatically */
export async function getAllStudios(perPage = 100): Promise<StudioCard[]> {
  try {
    // First page — also tells us how many total pages exist
    const url = new URL(`${WP_API_URL}/wp/v2/dance_studio?${FIELDS}`);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("status", "publish");
    url.searchParams.set("page", "1");

    const res1 = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res1.ok) throw new Error(`WP API ${res1.status}`);

    const totalPages = Number(res1.headers.get("X-WP-TotalPages") || "1");
    const page1: Record<string, unknown>[] = await res1.json();

    // Fetch remaining pages in parallel
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => {
        const u = new URL(url.toString());
        u.searchParams.set("page", String(i + 2));
        return fetch(u.toString(), {
          next: { revalidate: 3600 },
          headers: { "Content-Type": "application/json" },
        }).then((r) => r.json() as Promise<Record<string, unknown>[]>);
      })
    );

    const all = [page1, ...rest].flat();
    return all.map(mapWPPost).map(toCard);
  } catch {
    return [];
  }
}

/** Single studio by slug — full detail */
export async function getStudio(slug: string): Promise<Studio | null> {
  try {
    const posts = await fetchWP<Record<string, unknown>[]>(
      `/wp/v2/dance_studio?${FIELDS}`,
      { slug, status: "publish" }
    );
    if (!posts.length) return null;
    const studio = mapWPPost(posts[0]);

    // Override tier from Supabase claims — single source of truth for claim status.
    // WP ACF studio_tier field is a best-effort sync; Supabase is authoritative.
    try {
      const { data: claim } = await supabaseAdmin
        .from("claims")
        .select("status, tier")
        .eq("studio_slug", slug)
        .in("status", ["verified", "approved"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (claim) {
        studio.claimed = true;
        studio.tier = (claim.tier as string) || "claimed";
      }
    } catch {
      // Non-fatal — fall back to WP tier value
    }

    return studio;
  } catch {
    return null;
  }
}

/** All slugs for generateStaticParams */
export async function getAllStudioSlugs(): Promise<string[]> {
  const studios = await getAllStudios(500);
  return studios.map((s) => s.slug);
}

/** Convert URL city slug → display name (e.g. "los-angeles" → "Los Angeles") */
export function citySlugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Studios filtered by city slug */
export async function getStudiosByCity(citySlug: string): Promise<StudioCard[]> {
  const cityName = citySlugToName(citySlug).toLowerCase();
  const all = await getAllStudios(500);
  return all.filter((s) => s.city.toLowerCase() === cityName);
}
