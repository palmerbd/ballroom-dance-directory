import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";
import { StudioCard, STYLE_LABELS } from "@/types/studio";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ballroom Dance Lessons — Find Private Instruction Near You",
  description:
    "Find the best private ballroom dance lesson studios near you. Browse Fred Astaire, Arthur Murray, Dance With Me, and elite independent studios offering expert ballroom instruction.",
};

const STYLE_KEY = "ballroom";

const FAQ = [
  {
    q: "What is ballroom dancing?",
    a: "Ballroom dancing is a set of partner dances performed both competitively and socially. It includes dances like the Waltz, Foxtrot, Tango, Viennese Waltz, and Quickstep in the smooth/standard category, and can also refer broadly to all partner dance styles.",
  },
  {
    q: "How long does it take to learn ballroom dancing?",
    a: "Most beginners can learn the basic steps of a ballroom dance in just a few private lessons. Developing comfortable social dancing typically takes 10–20 lessons. Advanced technique and competition-level skills develop over months or years of consistent practice.",
  },
  {
    q: "Do I need a partner to take ballroom dance lessons?",
    a: "No — most studios pair solo students with instructors or rotating partners for group classes. Private lessons always pair you with a professional instructor, so no partner is required.",
  },
  {
    q: "How much do private ballroom dance lessons cost?",
    a: "Private lessons typically range from $75–$150 per session depending on the studio, instructor level, and market. Many studios offer introductory packages at reduced rates for new students.",
  },
];

export default async function BallroomDanceLessonsPage() {
  const allStudios = await getAllStudios(100);
  const studios = allStudios.filter((s) => s.danceStyles.includes(STYLE_KEY as any));

  // Get unique cities for the sidebar
  const cities = [...new Set(studios.map((s) => s.city).filter(Boolean))].sort();

  return (
    <main>
      {/* Hero */}
      <section
        className="px-6 py-20"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>
            Dance Style Guide
          </p>
          <h1 className="font-display text-white font-bold mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>
            Ballroom Dance Lessons
          </h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Discover private ballroom dance instruction at elite studios across the United States.
            Whether you&apos;re a complete beginner or refining your technique, find the studio that
            fits your goals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/studios?style=ballroom"
              className="px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
              Browse Ballroom Studios
            </Link>
            <Link href="/studios"
              className="px-6 py-3 rounded-lg font-semibold text-white/80 border border-white/20 hover:border-white/50 transition-all">
              All Studios
            </Link>
          </div>
        </div>
      </section>

      {/* What is ballroom */}
      <section className="px-6 py-16" style={{ background: "#f9f6f0" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-gray-900 text-2xl mb-5">
              What Is Ballroom Dancing?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ballroom dancing is one of the most elegant and rewarding forms of partner dance.
              Originating in the courts of Europe, ballroom today encompasses a wide range of styles
              taught in studios across the country &mdash; from the graceful flow of the Waltz to
              the dramatic character of the Tango, the lively Foxtrot, and the quickstepping Viennese Waltz.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Private ballroom instruction is the fastest way to develop real technique. Working
              one-on-one with a trained instructor, you get immediate feedback, a curriculum
              tailored to your learning pace, and none of the awkwardness of crowded group classes.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether your goal is to dance at your wedding, compete on the floor, or simply enjoy
              a lifelong social skill, ballroom lessons at the right studio can transform how you
              move and how you carry yourself.
            </p>

            <h3 className="font-display font-bold text-gray-900 text-xl mt-8 mb-4">Styles You&apos;ll Learn</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Waltz", "Foxtrot", "Tango", "Viennese Waltz", "Quickstep", "American Smooth"].map((style) => (
                <div key={style}
                  className="px-4 py-3 rounded-lg border text-sm font-semibold text-center"
                  style={{ borderColor: "#b8922a", color: "#7a5f1a", background: "#fdf8f0" }}>
                  {style}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 mb-3">Studios by City</h3>
              <ul className="space-y-2">
                {cities.slice(0, 8).map((city) => (
                  <li key={city}>
                    <Link
                      href={`/studios/city/${city.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm hover:underline"
                      style={{ color: "#b8922a" }}>
                      {city}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/studios" className="block mt-4 text-xs text-gray-400 hover:text-gray-700">
                View all cities →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 mb-3">Other Dance Styles</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Latin Dance", href: "/latin-dance-lessons" },
                  { label: "Tango", href: "/tango-dance-lessons" },
                  { label: "Wedding Dance", href: "/wedding-dance-lessons" },
                  { label: "Swing Dance", href: "/swing-dance-lessons" },
                  { label: "Competition", href: "/competition-dance-lessons" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline" style={{ color: "#b8922a" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Studios grid */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">
            Ballroom Dance Studios
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {studios.length} studios offering ballroom instruction
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {studios.slice(0, 12).map((studio) => (
              <Link key={studio.slug} href={`/studios/${studio.slug}`}
                className="block rounded-xl border border-gray-200 p-5 hover:border-yellow-400 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-yellow-700 transition-colors">
                    {studio.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {studio.city}{studio.city && studio.state ? ", " : ""}{studio.state}
                </p>
                {studio.rating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm" style={{ color: "#e8c560" }}>{"\u2605"}</span>
                    <span className="text-sm font-semibold text-gray-700">{studio.rating.toFixed(1)}</span>
                    {studio.reviewCount && (
                      <span className="text-xs text-gray-400">({studio.reviewCount})</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
          {studios.length > 12 && (
            <div className="mt-8 text-center">
              <Link href="/studios?style=ballroom"
                className="inline-block px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                View All {studios.length} Ballroom Studios
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16" style={{ background: "#f9f6f0" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-display font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="px-6 py-10 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
          <Link href="/latin-dance-lessons" className="hover:text-gray-900 transition-colors">Latin</Link>
          <Link href="/tango-dance-lessons" className="hover:text-gray-900 transition-colors">Tango</Link>
          <Link href="/wedding-dance-lessons" className="hover:text-gray-900 transition-colors">Wedding Dance</Link>
          <Link href="/swing-dance-lessons" className="hover:text-gray-900 transition-colors">Swing</Link>
          <Link href="/competition-dance-lessons" className="hover:text-gray-900 transition-colors">Competition</Link>
        </div>
      </section>
    </main>
  );
}
