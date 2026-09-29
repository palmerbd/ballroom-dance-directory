import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DanceBookingRank from "@/components/DanceBookingRank";
import { DANCE_BOOKING_RANK, getDbrCity } from "@/lib/dancebookingrank";

// Dance Booking Rank: a city's ranked studio list (see lib/dancebookingrank.ts).
const BASE_URL = "https://www.ballroomdancedirectory.com";

export function generateStaticParams() {
  return DANCE_BOOKING_RANK.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getDbrCity(city);
  if (!c) return { title: "Page Not Found" };
  const url = `${BASE_URL}/dancebookingrank/${c.slug}`;
  return {
    title: c.ranking.title,
    description: c.ranking.description,
    alternates: { canonical: url },
    openGraph: { title: c.ranking.title, description: c.ranking.description, type: "article", url, publishedTime: c.published },
  };
}

export default async function DanceBookingRankCityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getDbrCity(city);
  if (!c) notFound();
  return (
    <DanceBookingRank
      city={c}
      page={c.ranking}
      crumbs={[
        { href: "/", label: "Home" },
        { href: c.cityPage ?? "/studios", label: `${c.city} studios` },
        { label: "Dance Booking Rank" },
      ]}
    />
  );
}
