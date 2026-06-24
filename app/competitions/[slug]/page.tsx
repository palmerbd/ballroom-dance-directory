import { Metadata }  from "next";
import { notFound }   from "next/navigation";
import Link           from "next/link";
import Image          from "next/image";
import {
  COMPETITIONS,
  getBySlug,
  getByRegion,
  sortedByDate,
} from "@/lib/competitions-data";
import {
  Competition,
  COMP_STYLE_LABELS,
  COMP_ORG_LABELS,
  COMP_LEVEL_LABELS,
  COMP_REGION_LABELS,
  MONTHS,
} from "@/types/competition";
import { CompetitionCard } from "@/components/CompetitionCard";
import { supabaseAdmin }   from "@/lib/supabase-admin";

export const revalidate = 86400; // 24 hours \u2014 competition data from static file, changes infrequently

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return COMPETITIONS.map((c) => ({ slug: c.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp = getBySlug(slug);
  if (!comp) return {};
  const pageUrl = `https://www.ballroomdancedirectory.com/competitions/${slug}`;
  return {
    title: `${comp.name} | Ballroom Dance Competition`,
    description: comp.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${comp.name} \u2014 ${comp.city}, ${comp.state}`,
      description: comp.description,
      type: "website",
    },
  };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatFullDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatDateRange(start: string | null, end: string | null, typicalMonth: number): string {
  if (!start) return `Typically held in ${MONTHS[typicalMonth - 1]}`;
  if (!end || end === start) return formatFullDate(start);
  const s = new Date(start + "T12:00:00");
  const e = new Date(end   + "T12:00:00");
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString("en-US", { month: "long", day: "numeric" })}\u2013${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${formatFullDate(start)} \u2013 ${formatFullDate(end)}`;
}

// ── Style → hero image ────────────────────────────────────────────────────────

const STYLE_IMAGE: Record<string, string> = {
  standard: "/images/ballroom.png",
  latin:    "/images/latin.png",
  smooth:   "/images/ballroom.png",
  rhythm:   "/images/latin.png",
  swing:    "/images/swing.png",
  country:  "/images/ballroom.png",
  multi:    "/images/competition.png",
};

// ── Org → canonical website ───────────────────────────────────────────────────

const ORG_WEBSITE: Record<string, string> = {
  "NDCA":        "https://www.ndca.org",
  "USA Dance":   "https://www.usadance.org",
  "WDSF":        "https://www.worlddancesport.org",
  "Independent": "",
};

const SITE_URL = "https://www.ballroomdancedirectory.com";

// ── Schema.org Event JSON-LD ──────────────────────────────────────────────────

function EventSchema({ comp }: { comp: Competition }) {
  const heroPath = (comp.styles[0] && STYLE_IMAGE[comp.styles[0]]) || "/images/competition.png";
  const orgUrl   = ORG_WEBSITE[comp.organization] || comp.website || "";
  const pageUrl  = `${SITE_URL}/competitions/${comp.slug}`;

  // Always supply startDate — Google requires it for Event rich results.
  // For TBA competitions use the 1st of typicalMonth in the next upcoming year.
  const now        = new Date();
  const curYear    = now.getFullYear();
  const curMonth   = now.getMonth() + 1; // 1-12
  const approxYear = comp.typicalMonth >= curMonth ? curYear : curYear + 1;
  const startDate  = comp.dateStart ??
    `${approxYear}-${String(comp.typicalMonth).padStart(2, "0")}-01`;

  const schema = {
    "@context": "https://schema.org",
    "@type":    "DanceEvent",
    name:        comp.name,
    description: comp.description,
    url:         comp.website || pageUrl,
    // ── image (required by Google for rich results) ─────────────────────────
    image: `${SITE_URL}${heroPath}`,
    location: {
      "@type": "Place",
      name:    comp.venue,
      address: {
        "@type":         "PostalAddress",
        addressLocality: comp.city,
        addressRegion:   comp.stateAbbr,
        addressCountry:  "US",
      },
    },
    startDate,
    ...(comp.dateEnd && { endDate: comp.dateEnd }),
    eventStatus:         "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    // ── performer (required by Google) ──────────────────────────────────────
    performer: {
      "@type": "PerformingGroup",
      name:    "Competitive Ballroom Dancers",
    },
    // ── organizer with url ──────────────────────────────────────────────────
    organizer: {
      "@type": "Organization",
      name:    COMP_ORG_LABELS[comp.organization],
      ...(orgUrl && { url: orgUrl }),
    },
    // ── offers (registration / entry fee) ───────────────────────────────────
    offers: {
      "@type":       "Offer",
      url:           comp.registrationUrl || comp.website || pageUrl,
      priceCurrency: "USD",
      ...(comp.entryFeeMin != null && { price: comp.entryFeeMin }),
      availability:  "https://schema.org/InStock",
      ...(comp.registrationDeadline && { validThrough: comp.registrationDeadline }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Schema.org BreadcrumbList JSON-LD ────────────────────────────────────────

function BreadcrumbSchema({ comp }: { comp: Competition }) {
  const schema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",         item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Competitions", item: `${SITE_URL}/competitions` },
      { "@type": "ListItem", position: 3, name: comp.name,      item: `${SITE_URL}/competitions/${comp.slug}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Org badge colours ─────────────────────────────────────────────────────────

const ORG_BADGE: Record<string, { color: string; bg: string }> = {
  "NDCA":        { color: "#7c2d12", bg: "#fef2f2" },
  "USA Dance":   { color: "#1e3a5f", bg: "#eff6ff" },
  "WDSF":        { color: "#14532d", bg: "#f0fdf4" },
  "Independent": { color: "#4b5563", bg: "#f3f4f6" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seedComp = getBySlug(slug);
  if (!seedComp) notFound();

  // ── Apply organizer overrides (Stage 3) ────────────────────────────────────
  // Fetch any organizer-submitted edits from competition_overrides and merge
  // them over the static seed data. Only non-null override fields win.
  const [claimResult, overrideResult] = await Promise.all([
    supabaseAdmin
      .from("competition_claims")
      .select("status, tier")
      .eq("competition_slug", slug)
      .eq("status", "approved")
      .maybeSingle(),
    supabaseAdmin
      .from("competition_overrides")
      .select("date_start,date_end,venue,description,website,registration_url,registration_deadline")
      .eq("competition_slug", slug)
      .maybeSingle(),
  ]);

  const isVerified = !!claimResult.data;
  const ov         = overrideResult.data;

  // Merge: override fields win over seed data when present
  const comp = {
    ...seedComp,
    ...(ov?.date_start            && { dateStart:            ov.date_start }),
    ...(ov?.date_end              && { dateEnd:              ov.date_end }),
    ...(ov?.venue                 && { venue:                ov.venue }),
    ...(ov?.description           && { description:          ov.description }),
    ...(ov?.website               && { website:              ov.website }),
    ...(ov?.registration_url      && { registrationUrl:      ov.registration_url }),
    ...(ov?.registration_deadline && { registrationDeadline: ov.registration_deadline }),
  };

  const badge    = ORG_BADGE[comp.organization] ?? ORG_BADGE["Independent"];
  const heroSrc  = (comp.styles[0] && STYLE_IMAGE[comp.styles[0]]) || "/images/competition.png";
  const dateStr  = formatDateRange(comp.dateStart, comp.dateEnd, comp.typicalMonth);

  const related  = sortedByDate(
    getByRegion(comp.region).filter((c) => c.slug !== comp.slug)
  ).slice(0, 3);

  return (
    <>
      <EventSchema comp={comp} />
      <BreadcrumbSchema comp={comp} />

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative h-72 md:h-96 overflow-hidden bg-gradient-to-br from-[#0c1428] to-[#1a2d5a]">
          <Image
            src={heroSrc}
            alt={comp.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-4xl mx-auto">
            {/* Org + featured badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{ color: badge.color, background: badge.bg }}
              >
                {COMP_ORG_LABELS[comp.organization]}
              </span>
              {comp.tier === "paid" && (
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(184,146,42,0.9)", color: "#fff" }}>
                  ⭐ Featured
                </span>
              )}
              {comp.isRecurring && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                  Annual Event
                </span>
              )}
              {isVerified && (
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(29,78,216,0.85)", color: "#fff" }}>
                  ✓ Verified Organizer
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">
              {comp.name}
            </h1>
            <p className="text-gray-300 text-lg">
              {comp.venue} · {comp.city}, {comp.state}
            </p>
          </div>
        </section>

        {/* ── Details grid ─────────────────────────────────────────────────── */}
        <section className="py-12 px-4 sm:px-6" style={{ background: "#f9f6f0" }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Main info */}
            <div className="md:col-span-2 space-y-8">

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-display font-bold text-gray-900 text-xl mb-3">About This Competition</h2>
                <p className="text-gray-600 leading-relaxed">{comp.description}</p>
              </div>

              {/* Dance styles */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Dance Styles Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {comp.styles.map((s) => (
                    <Link
                      key={s}
                      href={`/competitions/style/${s}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full
                                 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                    >
                      {COMP_STYLE_LABELS[s]}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Competition Levels</h2>
                <div className="flex flex-wrap gap-2">
                  {comp.levels.map((l) => (
                    <span
                      key={l}
                      className="px-3 py-1.5 text-sm font-medium rounded-full border"
                      style={{ color: "#b8922a", borderColor: "#e8c560", background: "#fffbeb" }}
                    >
                      {COMP_LEVEL_LABELS[l]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 sticky top-24">
                <h3 className="font-display font-bold text-gray-900 text-lg">Competition Info</h3>

                <InfoRow icon="📅" label="Dates"  value={dateStr} />
                <InfoRow icon="📍" label="Venue"  value={comp.venue} />
                <InfoRow icon="🌍" label="Region" value={COMP_REGION_LABELS[comp.region]} />

                {comp.registrationDeadline && (
                  <InfoRow icon="⏰" label="Reg. Deadline" value={comp.registrationDeadline} />
                )}

                {(comp.entryFeeMin || comp.entryFeeMax) && (
                  <InfoRow
                    icon="💰"
                    label="Entry Fee"
                    value={
                      comp.entryFeeMin && comp.entryFeeMax
                        ? `$${comp.entryFeeMin}\u2013$${comp.entryFeeMax} per dance`
                        : comp.entryFeeMin
                          ? `From $${comp.entryFeeMin}`
                          : `Up to $${comp.entryFeeMax}`
                    }
                  />
                )}

                <hr className="border-gray-100" />

                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-lg font-bold text-gray-900
                               hover:brightness-110 transition-all"
                    style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
                  >
                    Visit Official Website →
                  </a>
                )}

                {comp.registrationUrl && (
                  <a
                    href={comp.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-lg font-bold border-2 border-yellow-400
                               text-yellow-800 hover:bg-yellow-50 transition-colors"
                  >
                    Register Now
                  </a>
                )}

                {isVerified ? (
                  <Link
                    href="/competitions/dashboard"
                    className="block w-full text-center py-2 text-sm font-semibold transition-colors
                               border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50"
                  >
                    ✓ Verified \u2014 Manage Your Listing
                  </Link>
                ) : (
                  <Link
                    href={`/competitions/claim?slug=${comp.slug}`}
                    className="block w-full text-center py-2 text-sm text-gray-400 hover:text-gray-600
                               transition-colors border border-gray-200 rounded-lg"
                  >
                    Are you the organizer? Claim this listing
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Related competitions ─────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="py-12 px-4 sm:px-6 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                More Competitions in the {COMP_REGION_LABELS[comp.region]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((c) => (
                  <CompetitionCard key={c.slug} comp={c} />
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href={`/competitions/region/${comp.region}`}
                  className="text-sm font-bold transition-colors"
                  style={{ color: "#b8922a" }}
                >
                  View all {COMP_REGION_LABELS[comp.region]} competitions →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
        <nav className="py-4 px-4 sm:px-6 bg-white border-t border-gray-100 text-sm text-gray-500">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>›</span>
            <Link href="/competitions" className="hover:text-gray-900">Competitions</Link>
            <span>›</span>
            <span className="text-gray-800">{comp.name}</span>
          </div>
        </nav>
      </main>
    </>
  );
}

// ── Info row helper ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-700 font-medium">{value}</p>
      </div>
    </div>
  );
}
