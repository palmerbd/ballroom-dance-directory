import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudiosByCity, citySlugToName } from "@/lib/wordpress";
import { StudioCard, CHAIN_CONFIG, STYLE_LABELS, DanceStyle } from "@/types/studio";
import {
  CITY_CONFIGS,
  getNeighborhood,
  matchStudiosToNeighborhood,
} from "@/lib/neighborhoods";

export const revalidate = 3600;

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const params: { city: string; neighborhood: string }[] = [];
  for (const city of CITY_CONFIGS) {
    for (const hood of city.neighborhoods) {
      params.push({ city: city.slug, neighborhood: hood.slug });
    }
  }
  return params;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; neighborhood: string }>;
}): Promise<Metadata> {
  const { city: citySlug, neighborhood: hoodSlug } = await params;
  const result = getNeighborhood(citySlug, hoodSlug);
  if (!result) return { title: "Not Found" };

  const { city, neighborhood } = result;
  return {
    title: `Ballroom Dance Studios in ${neighborhood.name}, ${city.name} | Ballroom Dance Directory`,
    description: `Find the best private dance studios in the ${neighborhood.name} area of ${city.name}, ${city.stateAbbr}. Top-rated studios offering ballroom, Latin, salsa, tango, and wedding dance lessons near ${neighborhood.name}.`,
    alternates: {
      canonical: `https://www.ballroomdancedirectory.com/studios/city/${citySlug}/${hoodSlug}`,
    },
    openGraph: {
      title: `Dance Studios in ${neighborhood.name}, ${city.name}`,
      description: `Private dance lesson studios in the ${neighborhood.name} neighborhood of ${city.name}. Book your first lesson today.`,
    },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full  }).map((_, i) => (
        <span key={`f${i}`} style={{ color: "#e8c560" }}>★</span>
      ))}
      {half && <span style={{ color: "#e8c560" }}>½</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-1 text-gray-500 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

function StudioListCard({ studio }: { studio: StudioCard }) {
  const chain  = CHAIN_CONFIG[studio.studioChain];
  const styles = studio.danceStyles.slice(0, 4);

  return (
    <Link
      href={`/studios/${studio.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-yellow-400
                 hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #b8922a, #e8c560)" }} />
      <div className="p-6">
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

        <h2 className="font-display font-bold text-gray-900 text-xl leading-snug mb-1
                       group-hover:text-yellow-800 transition-colors">
          {studio.title}
        </h2>

        {studio.tagline ? (
          <p className="text-sm text-gray-500 italic mb-3">{studio.tagline}</p>
        ) : studio.description ? (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{studio.description}</p>
        ) : null}

        {studio.tier !== "free" && studio.rating ? (
          <div className="flex items-center gap-2 mb-3">
            <Stars rating={studio.rating} />
            {studio.reviewCount ? (
              <span className="text-xs text-gray-400">({studio.reviewCount} reviews)</span>
            ) : null}
          </div>
        ) : null}

        {studio.address && (
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {studio.address}
          </p>
        )}

        {styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {styles.map((style) => (
              <span
                key={style}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                style={{ borderColor: "#e8c560", color: "#7a5c0a", background: "#fdf8f0" }}
              >
                {STYLE_LABELS[style as DanceStyle]}
              </span>
            ))}
            {studio.danceStyles.length > 4 && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                +{studio.danceStyles.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm font-bold" style={{ color: "#b8922a" }}>
            View Studio →
          </span>
          {studio.privateLessonRate && (
            <span className="text-xs text-gray-500">From {studio.privateLessonRate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ city: string; neighborhood: string }>;
}) {
  const { city: citySlug, neighborhood: hoodSlug } = await params;
  const result = getNeighborhood(citySlug, hoodSlug);
  if (!result) notFound();

  const { city, neighborhood } = result;

  // All studios in the city, then filter to neighborhood by address keywords
  const cityStudios = await getStudiosByCity(citySlug);
  const hoodStudios = matchStudiosToNeighborhood(
    cityStudios as unknown as { address?: string; city?: string; [key: string]: unknown }[],
    neighborhood.keywords
  ) as unknown as StudioCard[];

  // Studios to show: neighborhood matches first, then remaining city studios as "nearby"
  const hoodIds = new Set(hoodStudios.map((s: StudioCard) => s.id));
  const nearbyStudios = cityStudios
    .filter((s) => !hoodIds.has(s.id))
    .slice(0, 6);

  // Schema.org JSON-LD
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Ballroom Dance Studios in ${neighborhood.name}, ${city.name}`,
    "description": `Top-rated private dance studios in the ${neighborhood.name} area of ${city.name}, ${city.stateAbbr}`,
    "numberOfItems": hoodStudios.length,
    "itemListElement": hoodStudios.map((s: StudioCard, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": s.title,
      "url": `/studios/${s.slug}`,
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm mb-6" aria-label="Breadcrumb">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
            <span className="text-white/30 mx-2">/</span>
            <Link href="/studios" className="text-white/50 hover:text-white transition-colors">Studios</Link>
            <span className="text-white/30 mx-2">/</span>
            <Link
              href={`/studios/city/${city.slug}`}
              className="text-white/50 hover:text-white transition-colors"
            >
              {city.name}
            </Link>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/80">{neighborhood.name}</span>
          </nav>

          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#e8c560" }}>
            {city.name}, {city.stateAbbr}
          </p>
          <h1
            className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            Ballroom Dance Studios in {neighborhood.name}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mb-8">
            {hoodStudios.length > 0
              ? `${hoodStudios.length} studio${hoodStudios.length !== 1 ? "s" : ""} found in the ${neighborhood.name} area`
              : `Explore studios near ${neighborhood.name} in ${city.name}`}
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80">
              📍 {neighborhood.name}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80">
              🏙 {city.name}, {city.stateAbbr}
            </span>
            {hoodStudios.length > 0 && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80">
                🎵 {hoodStudios.length} Studi{hoodStudios.length === 1 ? "o" : "os"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main content ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Neighborhood intro */}
            <div>
              <h2 className="font-display font-bold text-gray-900 text-2xl mb-4">
                Dancing in {neighborhood.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {neighborhood.description}
              </p>
            </div>

            {/* Studio results */}
            {hoodStudios.length > 0 ? (
              <div>
                <h2 className="font-display font-bold text-gray-900 text-xl mb-5">
                  Studios in {neighborhood.name}
                  <span className="ml-2 text-base font-normal text-gray-400">
                    ({hoodStudios.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {hoodStudios.map((studio: StudioCard) => (
                    <StudioListCard key={studio.id} studio={studio} />
                  ))}
                </div>
              </div>
            ) : (
              /* No direct matches — show SEO-friendly message + city fallback */
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">💃</div>
                <h2 className="font-display font-bold text-gray-900 text-xl mb-2">
                  Expanding to {neighborhood.name} soon
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We&apos;re actively adding studios to the {neighborhood.name} area. In the meantime,
                  explore all studios in {city.name} — many offer lessons convenient to {neighborhood.name}.
                </p>
                <Link
                  href={`/studios/city/${city.slug}`}
                  className="inline-block px-6 py-2.5 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
                >
                  Browse All {city.name} Studios
                </Link>
              </div>
            )}

            {/* Nearby studios (if we have hood results, suggest more from the city) */}
            {hoodStudios.length > 0 && nearbyStudios.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-gray-900 text-xl mb-2">
                  More Studios Near {neighborhood.name}
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                  Other top-rated studios in {city.name} that serve the {neighborhood.name} area.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {nearbyStudios.map((studio) => (
                    <StudioListCard key={studio.id} studio={studio} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href={`/studios/city/${city.slug}`}
                    className="inline-block px-6 py-2.5 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
                  >
                    View All {city.name} Studios
                  </Link>
                </div>
              </div>
            )}

            {/* SEO body copy */}
            <div className="prose prose-sm max-w-none text-gray-600">
              <h2 className="font-display font-bold text-gray-900 text-xl not-prose mb-3">
                Private Dance Lessons in {neighborhood.name}
              </h2>
              <p>
                Finding the right private dance studio in {neighborhood.name} starts with knowing what
                you&apos;re looking for. Whether you&apos;re preparing for your wedding first dance, training
                for a competition, or simply looking to add a new skill and social outlet to your life,
                the studios listed here serve the {neighborhood.name} area of {city.name}, {city.stateAbbr}.
              </p>
              <p>
                Private lessons give you one-on-one attention that group classes simply can&apos;t match.
                Your instructor can adapt to your learning pace, correct technique in real time, and
                design a curriculum around your specific goals — whether that&apos;s a particular dance style,
                a performance date, or a fitness target.
              </p>
              <p>
                The top styles available at {neighborhood.name} area studios include ballroom, Latin,
                salsa, tango, waltz, foxtrot, and swing. Many studios also offer specialized wedding
                dance packages, competition training, and social dance preparation programs.
              </p>
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* City tip */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 text-base mb-3">
                Dancing in {city.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{city.intro}</p>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-700 mb-1">Pro Tip</p>
                <p className="text-sm text-yellow-900">{city.tip}</p>
              </div>
            </div>

            {/* Other neighborhoods in this city */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 text-base mb-3">
                {city.name} Neighborhoods
              </h3>
              <div className="space-y-0.5">
                {city.neighborhoods
                  .filter((n) => n.slug !== neighborhood.slug)
                  .map((n) => (
                    <Link
                      key={n.slug}
                      href={`/studios/city/${city.slug}/${n.slug}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg text-sm
                                 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                    >
                      <span>{n.name}</span>
                      <span className="text-gray-300">→</span>
                    </Link>
                  ))}
                <Link
                  href={`/studios/city/${city.slug}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-sm
                             font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2
                             border-t border-gray-100 pt-3"
                >
                  <span>All {city.name} Studios</span>
                  <span className="text-gray-300">→</span>
                </Link>
              </div>
            </div>

            {/* Other cities */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 text-base mb-3">Other Cities</h3>
              <div className="space-y-0.5">
                {[
                  { slug: "los-angeles", name: "Los Angeles" },
                  { slug: "chicago",     name: "Chicago" },
                  { slug: "dallas",      name: "Dallas" },
                  { slug: "miami",       name: "Miami" },
                  { slug: "houston",     name: "Houston" },
                ]
                  .filter((c) => c.slug !== citySlug)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/studios/city/${c.slug}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg text-sm
                                 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                    >
                      <span>{c.name}</span>
                      <span className="text-gray-300">→</span>
                    </Link>
                  ))}
              </div>
            </div>

            <Link
              href="/studios"
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← View all studios
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900">Ballroom Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">
              America&apos;s premier resource for private dance instruction
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
            <Link href={`/studios/city/${city.slug}`} className="hover:text-gray-900 transition-colors">
              {city.name} Studios
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
