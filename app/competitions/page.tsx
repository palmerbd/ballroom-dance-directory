import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CompetitionFilters } from "@/components/CompetitionFilters";
import { CompetitionCard }   from "@/components/CompetitionCard";
import {
  COMPETITIONS,
  getFeatured,
  sortedByDate,
} from "@/lib/competitions-data";
import { COMP_REGION_LABELS, COMP_STYLE_LABELS } from "@/types/competition";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ballroom Dance Competitions | US Competition Calendar",
  description:
    "Find upcoming ballroom dance competitions across the United States. Browse by region, style, or organization — NDCA, USA Dance, WDSF, and Independent events.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/competitions" },
  openGraph: {
    title: "Ballroom Dance Competitions | US Competition Calendar",
    description:
      "Find upcoming US ballroom dance competitions. Filter by region, style (Standard, Latin, Smooth, Rhythm), and level.",
    type: "website",
  },
};

// ── Featured strip ────────────────────────────────────────────────────────────

function FeaturedStrip() {
  const featured = getFeatured().slice(0, 4);
  if (featured.length === 0) return null;
  return (
    <section className="py-10 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display text-xl font-bold text-gray-900">Featured Competitions</h2>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full"
            style={{ background: "rgba(184,146,42,0.15)", color: "#b8922a" }}>
            ⭐ Premier Events
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {featured.map((comp) => (
            <CompetitionCard key={comp.slug} comp={comp} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Browse-by links ───────────────────────────────────────────────────────────

const HIGHLIGHT_REGIONS = [
  "northeast", "southeast", "midwest", "southwest", "west", "mountain",
] as const;

const HIGHLIGHT_STYLES = [
  "standard", "latin", "smooth", "rhythm", "swing",
] as const;

function BrowseLinks() {
  return (
    <section className="py-10 px-4 sm:px-6 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* By Region */}
        <div>
          <h3 className="font-display font-bold text-gray-800 mb-4">Browse by Region</h3>
          <ul className="space-y-2">
            {HIGHLIGHT_REGIONS.map((r) => (
              <li key={r}>
                <Link
                  href={`/competitions/region/${r}`}
                  className="text-sm text-gray-600 hover:text-yellow-800 transition-colors"
                >
                  {COMP_REGION_LABELS[r]} →
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* By Style */}
        <div>
          <h3 className="font-display font-bold text-gray-800 mb-4">Browse by Style</h3>
          <ul className="space-y-2">
            {HIGHLIGHT_STYLES.map((s) => (
              <li key={s}>
                <Link
                  href={`/competitions/style/${s}`}
                  className="text-sm text-gray-600 hover:text-yellow-800 transition-colors"
                >
                  {COMP_STYLE_LABELS[s]} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SITE_URL = "https://www.ballroomdancedirectory.com";

export default function CompetitionsPage() {
  const all = sortedByDate(COMPETITIONS);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ballroom Dance Competitions — US Calendar",
    description: "Upcoming NDCA, USA Dance, WDSF, and Independent ballroom dance competitions across the United States.",
    url: `${SITE_URL}/competitions`,
    numberOfItems: all.length,
    itemListElement: all.slice(0, 20).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${SITE_URL}/competitions/${c.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <main>
      {/* Hero */}
      <section className="text-white py-16 px-4 sm:px-6 text-center"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <p className="text-sm uppercase tracking-widest mb-3 font-medium"
          style={{ color: "#e8c560" }}>
          Competition Calendar
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Ballroom Dance Competitions
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          Discover upcoming NDCA, USA Dance, WDSF, and Independent competitions across the
          United States — from local showcases to national championships.
        </p>
        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-200">
            🏆 {all.length} competitions listed
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-200">
            🗺 All 6 US regions
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-200">
            💃 Pro, Amateur &amp; Pro/Am
          </span>
        </div>
      </section>

      {/* Featured competitions */}
      <FeaturedStrip />

      {/* Browse links */}
      <BrowseLinks />

      {/* All competitions with filter */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-2">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            All Competitions
          </h2>
        </div>
        <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading…</div>}>
          <CompetitionFilters competitions={all} />
        </Suspense>
      </div>
    </main>
    </>
  );
}
