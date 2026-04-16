import { Metadata }  from "next";
import { notFound }  from "next/navigation";
import Link          from "next/link";
import { Suspense }  from "react";
import {
  getByRegion,
  sortedByDate,
} from "@/lib/competitions-data";
import {
  COMP_REGION_LABELS,
  CompRegion,
} from "@/types/competition";
import { CompetitionFilters } from "@/components/CompetitionFilters";

export const revalidate = 3600;

const VALID_REGIONS = Object.keys(COMP_REGION_LABELS) as CompRegion[];

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return VALID_REGIONS.map((region) => ({ region }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const label = COMP_REGION_LABELS[region as CompRegion];
  if (!label) return {};
  const pageUrl = `https://www.ballroomdancedirectory.com/competitions/region/${region}`;
  return {
    title: `${label} Ballroom Dance Competitions`,
    description: `Find ballroom dance competitions in the ${label} United States. NDCA, USA Dance, WDSF, and Independent events.`,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${label} Ballroom Dance Competitions`,
      description: `Upcoming ballroom dance competitions in the ${label} region.`,
      type: "website",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SITE_URL = "https://www.ballroomdancedirectory.com";

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const typedRegion = region as CompRegion;

  if (!VALID_REGIONS.includes(typedRegion)) notFound();

  const label = COMP_REGION_LABELS[typedRegion];
  const comps = sortedByDate(getByRegion(region));
  const otherRegions = VALID_REGIONS.filter((r) => r !== typedRegion);

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
          <span className="text-gray-200">By Region</span>
          <span>›</span>
          <span className="text-white">{label}</span>
        </nav>
        <p className="text-sm uppercase tracking-widest mb-3 font-medium" style={{ color: "#e8c560" }}>
          Regional Directory
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          {label} Competitions
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          {comps.length} ballroom dance competition{comps.length !== 1 ? "s" : ""} in the {label} region.
          Filter by style, level, or organization.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {otherRegions.map((r) => (
            <Link
              key={r}
              href={`/competitions/region/${r}`}
              className="px-3 py-1.5 text-xs rounded-full bg-white/10 text-gray-200
                         hover:bg-white/20 transition-colors"
            >
              {COMP_REGION_LABELS[r]}
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
