import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";
import { StudioSearch } from "./StudioSearch";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Find Private Dance Studios Near You",
  description:
    "Browse 100+ private dance studios across America. Filter by city, dance style, and rating. Fred Astaire, Arthur Murray, Dance With Me, and elite independent studios offering ballroom, Latin, tango, and wedding dance lessons.",
};

export default async function StudiosPage() {
  const studios = await getAllStudios(100);

  return (
    <main>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm mb-6">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/80">Studios</span>
          </nav>
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#e8c560" }}>
            The Directory
          </p>
          <h1
            className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Private Dance Studios
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {studios.length > 0
              ? `${studios.length} elite studio${studios.length !== 1 ? "s" : ""} listed — search and filter to find the perfect fit.`
              : "Discover elite private dance studios offering instruction in ballroom, Latin, tango, and more."}
          </p>
        </div>
      </section>

      {/* ── Search + filter + grid (client component) ───────────────────── */}
      <StudioSearch studios={studios} />

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-3">
            Own a Dance Studio?
          </h2>
          <p className="text-gray-500 mb-6">
            List your studio in our directory and connect with students actively searching for private lessons.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
          >
            Get Listed
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900">Private Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">
              America&apos;s premier resource for private dance instruction
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
            <Link href="/ballroom-dance-lessons" className="hover:text-gray-900 transition-colors">Ballroom</Link>
            <Link href="/wedding-dance-lessons" className="hover:text-gray-900 transition-colors">Wedding Dance</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
