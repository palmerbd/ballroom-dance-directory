import { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getStudiosByCity, citySlugToName } from "@/lib/wordpress";
import {
  StudioCard, CHAIN_CONFIG, STYLE_LABELS, DanceStyle, DANCE_STYLES,
} from "@/types/studio";
import { getStyleIntroCopy } from "@/lib/seo-copy";

export const revalidate = 3600;

// ── Style slug helpers ────────────────────────────────────────────────────────
// URL uses hyphens (wedding-dance), DanceStyle uses underscores (wedding_dance)

function styleSlugToType(slug: string): DanceStyle | null {
  const normalized = slug.replace(/-/g, "_") as DanceStyle;
  return DANCE_STYLES.includes(normalized) ? normalized : null;
}

function styleTypeToSlug(style: DanceStyle): string {
  return style.replace(/_/g, "-");
}

// ── Static params: pre-build top cities × all styles ─────────────────────────
// ISR covers any other combo on first request.

export async function generateStaticParams() {
  const topCities = [
    "los-angeles", "new-york-city", "chicago", "houston", "dallas",
    "miami", "phoenix", "atlanta", "seattle", "denver",
    "las-vegas", "boston", "san-diego", "austin", "tampa",
    "nashville", "orlando", "portland", "san-antonio", "minneapolis",
  ];
  const params: { city: string; style: string }[] = [];
  for (const city of topCities) {
    for (const style of DANCE_STYLES) {
      params.push({ city, style: styleTypeToSlug(style) });
    }
  }
  return params;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; style: string }>;
}): Promise<Metadata> {
  const { city, style } = await params;
  const styleType = styleSlugToType(style);
  if (!styleType) return {
    title: "Not Found",
    alternates: { canonical: `https://www.ballroomdancedirectory.com/studios` },
  };

  const cityName  = citySlugToName(city);
  const styleName = STYLE_LABELS[styleType];
  const studios   = await getStudiosByCity(city);
  const filtered  = studios.filter((s) => s.danceStyles.includes(styleType));

  // 0 studios: page does permanentRedirect to city page — point canonical there too
  if (!filtered.length) return {
    title: `Dance Studios in ${cityName}`,
    alternates: { canonical: `https://www.ballroomdancedirectory.com/studios/city/${city}` },
  };

  // Thin content guard: a single studio doesn't make a useful directory page.
  // Noindex these so Google stops "Crawled - currently not indexed" churn.
  // The page still renders (users can land here) but won't appear in search.
  // Canonical points to the style page itself to consolidate what signals exist.
  if (filtered.length < 2) {
    return {
      title: `${styleName} Dance Studios in ${cityName} | Ballroom Dance Directory`,
      robots: { index: false, follow: true },
      alternates: { canonical: `https://www.ballroomdancedirectory.com/studios/city/${city}/style/${style}` },
    };
  }

  return {
    title: `${styleName} Dance Studios in ${cityName} | Ballroom Dance Directory`,
    description: `Find the best ${styleName.toLowerCase()} dance studios in ${cityName}. ${filtered.length} studio${filtered.length !== 1 ? "s" : ""} offering expert private ${styleName.toLowerCase()} instruction. Book your first lesson today.`,
    alternates: {
      canonical: `https://www.ballroomdancedirectory.com/studios/city/${city}/style/${style}`,
    },
    openGraph: {
      title: `${styleName} Dance Studios in ${cityName}`,
      description: `Discover ${filtered.length} top-rated ${styleName.toLowerCase()} dance studios in ${cityName} offering private lessons.`,
    },
  };
}

// ── Stars ─────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} style={{ color: "#e8c560" }}>★</span>)}
      {half && <span style={{ color: "#e8c560" }}>½</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-gray-300">★</span>)}
      <span className="ml-1 text-gray-500 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Studio card ───────────────────────────────────────────────────────────────

function StudioCard_({ studio }: { studio: StudioCard }) {
  const chain = CHAIN_CONFIG[studio.studioChain];
  return (
    <Link
      href={`/studios/${studio.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-yellow-400
                 hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #b8922a, #e8c560)" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ color: chain.color, background: chain.bg }}
          >
            {chain.label}
          </span>
          {studio.tier === "paid" && (
            <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
              Featured
            </span>
          )}
        </div>
        <h2 className="font-display font-bold text-gray-900 text-lg leading-snug mb-1
                       group-hover:text-yellow-800 transition-colors">
          {studio.title}
        </h2>
        {studio.tagline ? (
          <p className="text-sm text-gray-500 italic mb-3 line-clamp-2">{studio.tagline}</p>
        ) : studio.description ? (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{studio.description}</p>
        ) : null}
        {studio.rating && (
          <div className="mb-3">
            <Stars rating={studio.rating} />
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {[studio.city, studio.state].filter(Boolean).join(", ")}
          </span>
          {studio.privateLessonRate && (
            <span className="text-sm font-bold" style={{ color: "#b8922a" }}>
              {studio.privateLessonRate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CityStylePage({
  params,
}: {
  params: Promise<{ city: string; style: string }>;
}) {
  const { city, style } = await params;

  const styleType = styleSlugToType(style);
  if (!styleType) notFound();

  const cityName  = citySlugToName(city);
  const styleName = STYLE_LABELS[styleType];
  const allCityStudios = await getStudiosByCity(city);
  const studios = allCityStudios
    .filter((s) => s.danceStyles.includes(styleType))
    .sort((a, b) => {
      // Featured first, then by rating
      if (a.tier === "paid" && b.tier !== "paid") return -1;
      if (b.tier === "paid" && a.tier !== "paid") return 1;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

  // No studios offer this style in this city — redirect to the city page rather
  // than serving a 404. This keeps GSC coverage clean for all city×style combos.
  if (!studios.length) permanentRedirect(`/studios/city/${city}`);

  const state = studios[0]?.state || "";

  // Other styles available in this city
  const otherStyles = DANCE_STYLES.filter(
    (s) => s !== styleType && allCityStudios.some((st) => st.danceStyles.includes(s))
  );

  // Schema.org
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${styleName} Dance Studios in ${cityName}`,
    "description": `Top-rated private ${styleName.toLowerCase()} dance studios in ${cityName}, ${state}`,
    "numberOfItems": studios.length,
    "itemListElement": studios.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": s.title,
      "url": `https://www.ballroomdancedirectory.com/studios/${s.slug}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://www.ballroomdancedirectory.com" },
      { "@type": "ListItem", "position": 2, "name": "Studios", "item": "https://www.ballroomdancedirectory.com/studios" },
      { "@type": "ListItem", "position": 3, "name": `Dance Studios in ${cityName}`, "item": `https://www.ballroomdancedirectory.com/studios/city/${city}` },
      { "@type": "ListItem", "position": 4, "name": `${styleName} in ${cityName}`,  "item": `https://www.ballroomdancedirectory.com/studios/city/${city}/style/${style}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 60%, #2d1f0e 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #e8c560 0, #e8c560 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }}
        />
        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
            <span className="text-white/30 mx-2">/</span>
            <Link href="/studios" className="text-white/50 hover:text-white transition-colors">Studios</Link>
            <span className="text-white/30 mx-2">/</span>
            <Link href={`/studios/city/${city}`} className="text-white/50 hover:text-white transition-colors">{cityName}</Link>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/80">{styleName}</span>
          </nav>

          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#e8c560" }}>
            {state ? `${state} · ` : ""}{styleName} Dance
          </p>
          <h1
            className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            {styleName} Dance Studios<br />
            <span style={{ color: "#e8c560" }}>in {cityName}</span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-2xl">
            {studios.length} studio{studios.length !== 1 ? "s" : ""} offering private {styleName.toLowerCase()} instruction in {cityName}
            {state ? `, ${state}` : ""}.
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80">
              🎵 {studios.length} Studio{studios.length !== 1 ? "s" : ""}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80">
              📍 {cityName}{state ? `, ${state}` : ""}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80">
              💃 {styleName}
            </span>
          </div>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Studio grid */}
          <div className="lg:col-span-2">
            {/* SEO intro copy */}
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl mb-8">
              {getStyleIntroCopy(city, style)}
            </p>

            <h2 className="font-display font-bold text-gray-900 text-xl mb-6">
              {styleName} Studios in {cityName}
              <span className="ml-2 text-sm font-normal text-gray-400">({studios.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {studios.map((studio) => (
                <StudioCard_ key={studio.id} studio={studio} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Other styles in this city */}
            {otherStyles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-display font-bold text-gray-900 text-base mb-1">
                  More Styles in {cityName}
                </h3>
                <p className="text-xs text-gray-400 mb-4">Browse by dance style</p>
                <div className="space-y-0.5">
                  {otherStyles.slice(0, 8).map((s) => (
                    <Link
                      key={s}
                      href={`/studios/city/${city}/style/${styleTypeToSlug(s)}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg text-sm
                                 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                    >
                      <span className="font-medium">{STYLE_LABELS[s]}</span>
                      <span className="text-gray-300">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All studios in city */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 text-base mb-3">
                All Studios in {cityName}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {allCityStudios.length} total studios across all dance styles.
              </p>
              <Link
                href={`/studios/city/${city}`}
                className="block w-full text-center py-2.5 rounded-xl text-sm font-bold border-2 border-yellow-200
                           text-yellow-800 hover:bg-yellow-50 transition-colors"
              >
                View all {cityName} studios →
              </Link>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{ background: "linear-gradient(135deg, #0c1428, #1a2d5a)" }}
            >
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "#e8c560" }}>
                Studio Owners
              </p>
              <h3 className="font-display font-bold text-white text-lg mb-2">
                Teach {styleName} in {cityName}?
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Claim your listing to appear at the top of this page and reach students
                actively searching for {styleName.toLowerCase()} instruction.
              </p>
              <Link
                href="/claim"
                className="block text-center w-full py-3 rounded-xl font-bold text-gray-900 text-sm
                           transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
              >
                Claim Your Studio →
              </Link>
            </div>

            {/* Other top markets */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 text-base mb-3">
                {styleName} in Other Cities
              </h3>
              <div className="space-y-0.5">
                {[
                  { slug: "los-angeles",   name: "Los Angeles" },
                  { slug: "new-york-city", name: "New York City" },
                  { slug: "chicago",       name: "Chicago" },
                  { slug: "miami",         name: "Miami" },
                  { slug: "houston",       name: "Houston" },
                  { slug: "dallas",        name: "Dallas" },
                  { slug: "atlanta",       name: "Atlanta" },
                  { slug: "seattle",       name: "Seattle" },
                  { slug: "denver",        name: "Denver" },
                  { slug: "phoenix",       name: "Phoenix" },
                ].filter((c) => c.slug !== city).slice(0, 8).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/studios/city/${c.slug}/style/${style}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-sm
                               text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                  >
                    <span>{c.name}</span>
                    <span className="text-gray-300">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/studios" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              ← All studios directory
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900">Ballroom Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">America&apos;s premier resource for private dance instruction</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
            <Link href={`/studios/city/${city}`} className="hover:text-gray-900 transition-colors">{cityName}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
