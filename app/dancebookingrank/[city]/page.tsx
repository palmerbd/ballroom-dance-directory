import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DanceBookingRank from "@/components/DanceBookingRank";
import { DANCE_BOOKING_RANK, getDbrCity } from "@/lib/dancebookingrank";

// Dance Booking Rank: a city's ranked studio list (see lib/dancebookingrank.ts).
const BASE_URL = "https://www.ballroomdancedirectory.com";

// Oct 2026 recovery plan: the generated JSON titles say "Best Dance Studios", but the
// ranking scores websites and search visibility, not teaching quality. Title/H1 are
// overridden here (template only — the JSON files are not edited).
function dbrTitle(city: string, stateAbbr: string) {
  return `${city}, ${stateAbbr} Dance Studios Ranked by Online Visibility (Dance Booking Rank 2026)`;
}

export function generateStaticParams() {
  return DANCE_BOOKING_RANK.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getDbrCity(city);
  if (!c) return { title: "Page Not Found" };
  const url = `${BASE_URL}/dancebookingrank/${c.slug}`;
  const title = dbrTitle(c.city, c.stateAbbr);
  return {
    title,
    description: c.ranking.description,
    alternates: { canonical: url },
    openGraph: { title, description: c.ranking.description, type: "article", url, publishedTime: c.published },
  };
}

export default async function DanceBookingRankCityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getDbrCity(city);
  if (!c) notFound();
  return (
    <>
    <DanceBookingRank
      city={c}
      page={{ ...c.ranking, h1: `${c.city} Dance Studios Ranked by Online Visibility (2026)` }}
      crumbs={[
        { href: "/", label: "Home" },
        { href: c.cityPage ?? "/studios", label: `${c.city} studios` },
        { label: "Dance Booking Rank" },
      ]}
    />
    <section className="px-6 pb-14 bg-white">
      <p className="max-w-3xl mx-auto text-sm text-gray-500 leading-relaxed">
        <strong>Independence:</strong> Dance Booking Rank scores each studio&apos;s public website,
        Google local results and AI-search visibility. It does not rate teaching quality. Placement
        cannot be purchased, and Featured listings on Ballroom Dance Directory do not affect the ranking.
      </p>
    </section>
    </>
  );
}
