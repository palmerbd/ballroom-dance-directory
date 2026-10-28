import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DanceBookingRank from "@/components/DanceBookingRank";
import { DANCE_BOOKING_RANK, getDbrCity } from "@/lib/dancebookingrank";

// Dance Booking Rank: the full SEO / AI-visibility report behind a city's ranking.
const BASE_URL = "https://www.ballroomdancedirectory.com";

export function generateStaticParams() {
  return DANCE_BOOKING_RANK.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getDbrCity(city);
  if (!c) return { title: "Page Not Found" };
  const url = `${BASE_URL}/dancebookingrank/${c.slug}/seo-details`;
  return {
    title: c.details.title,
    description: c.details.description,
    // Oct 2026 recovery plan: website-SEO report pages are off-topic for a consumer
    // directory, so they stay live but out of search indexes.
    robots: { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: { title: c.details.title, description: c.details.description, type: "article", url, publishedTime: c.published },
  };
}

export default async function DanceBookingRankDetailsPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getDbrCity(city);
  if (!c) notFound();
  return (
    <DanceBookingRank
      city={c}
      page={c.details}
      wide
      crumbs={[
        { href: "/", label: "Home" },
        { href: c.cityPage ?? "/studios", label: `${c.city} studios` },
        { href: `/dancebookingrank/${c.slug}`, label: "Dance Booking Rank" },
        { label: "SEO details" },
      ]}
    />
  );
}
