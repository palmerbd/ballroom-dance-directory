import { Metadata }  from "next";
import { notFound }  from "next/navigation";
import Link          from "next/link";
import { Suspense }  from "react";
import {
  getByStyle,
  sortedByDate,
} from "@/lib/competitions-data";
import {
  COMP_STYLE_LABELS,
  CompStyle,
} from "@/types/competition";
import { CompetitionFilters } from "@/components/CompetitionFilters";

export const revalidate = 3600;

const VALID_STYLES = Object.keys(COMP_STYLE_LABELS) as CompStyle[];

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return VALID_STYLES.map((style) => ({ style }));
}

// ── Style descriptions ────────────────────────────────────────────────────────

const STYLE_DESCRIPTION: Record<CompStyle, string> = {
  standard: "International Standard competitions feature the Waltz, Tango, Viennese Waltz, Foxtrot, and Quickstep — the elegant ballroom dances judged by WDSF and NDCA across professional and amateur divisions.",
  latin:    "International Latin competitions showcase Cha Cha, Samba, Rumba, Paso Doble, and Jive — the passionate, rhythmic dances of the WDSF and NDCA international circuit.",
  smooth:   "American Smooth competitions highlight the American style of Waltz, Tango, Foxtrot, and Viennese Waltz — with open figures, underarm turns, and side-by-side choreography.",
  rhythm:   "American Rhythm competitions feature Cha Cha, Rumba, East Coast Swing, Bolero, and Mambo — the American style Latin dances popular at NDCA and USA Dance events.",
  swing:    "Swing competitions include East Coast Swing, West Coast Swing, Lindy Hop, and related swing dances — energetic partner dances with improvisational flair.",
  country:  "Country Western competitions showcase Two-Step, Waltz, Polka, and other country dance styles — popular at USA Dance sanctioned events across the Midwest and South.",
  multi:    "Multi-dance competitions offer a mix of styles across multiple disciplines, giving competitors the chance to showcase versatility in Standard, Latin, Smooth, and Rhythm.",
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  const label = COMP_STYLE_LABELS[style as CompStyle];
  if (!label) return {};
  const pageUrl = `https://www.ballroomdancedirectory.com/competitions/style/${style}`;
  return {
    title: `${label} Ballroom Dance Competitions`,
    description: STYLE_DESCRIPTION[style as CompStyle],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${label} Competitions`,
      description: STYLE_DESCRIPTION[style as CompStyle],
      type: "website",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SITE_URL = "https://www.ballroomdancedirectory.com";

export default async function StylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  const typedStyle = style as CompStyle;

  if (!VALID_STYLES.includes(typedStyle)) notFound();

  const label       = COMP_STYLE_LABELS[typedStyle];
  const comps       = sortedByDate(getByStyle(style));
  const description = STYLE_DESCRIPTION[typedStyle];
  const otherStyles = VALID_STYLES.filter((s) => s !== typedStyle);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",         item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Competitions", item: `${SITE_URL}/competitions` },
      { "@type": "ListItem", position: 3, name: `${label} Competitions` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
      {/* Hero */}
      <section className="text-white py-14 px-4 sm:px-6 text-center"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2 justify-center">
          <Link href="/competitions" className="hover:text-white transition-colors">Competitions</Link>
          <span>›</span>
          <span className="text-gray-200">By Style</span>
          <span>›</span>
          <span className="text-white">{label}</span>
        </nav>
        <p className="text-sm uppercase tracking-widest mb-3 font-medium" style={{ color: "#e8c560" }}>
          Style Directory
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          {label} Competitions
        </h1>
        <p className="text-base text-gray-300 max-w-2xl mx-auto mb-6">
          {description}
        </p>
        <p className="text-sm text-gray-400 mb-6">
          {comps.length} competition{comps.length !== 1 ? "s" : ""} featuring {label}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {otherStyles.map((s) => (
            <Link
              key={s}
              href={`/competitions/style/${s}`}
              className="px-3 py-1.5 text-xs rounded-full bg-white/10 text-gray-200
                         hover:bg-white/20 transition-colors"
            >
              {COMP_STYLE_LABELS[s]}
            </Link>
          ))}
        </div>
      </section>

      {/* Filter + grid */}
      <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading…</div>}>
        <CompetitionFilters competitions={comps} />
      </Suspense>

      {/* Breadcrumb */}
      <nav className="py-4 px-4 sm:px-6 bg-white border-t border-gray-100 text-sm text-gray-500">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>›</span>
          <Link href="/competitions" className="hover:text-gray-900">Competitions</Link>
          <span>›</span>
          <span className="text-gray-800">{label}</span>
        </div>
      </nav>
    </main>
    </>
  );
}
