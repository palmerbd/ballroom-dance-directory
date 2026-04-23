import { Metadata } from "next";
import Link from "next/link";
import { DANCE_STYLES, STYLE_LABELS } from "@/types/studio";
import { getAllStudios } from "@/lib/wordpress";
import styles from "./hero-search.module.css";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Private Dance Lessons Directory — Find Elite Studios Near You",
  description:
    "Discover the finest private dance instruction studios across the United States. Fred Astaire, Arthur Murray, Dance With Me, and elite independent studios.",
  alternates: {
    canonical: "https://www.ballroomdancedirectory.com",
  },
};

const FEATURED_STYLES = [
  { key: "ballroom",    href: "/ballroom-dance-lessons",    label: "Ballroom",      desc: "Classic elegance, refined technique" },
  { key: "latin",       href: "/latin-dance-lessons",       label: "Latin",          desc: "Salsa, Rumba, Cha-Cha & more" },
  { key: "tango",       href: "/tango-dance-lessons",       label: "Tango",          desc: "Passion and precision" },
  { key: "wedding",     href: "/wedding-dance-lessons",     label: "Wedding Dance",  desc: "Your perfect first dance" },
  { key: "swing",       href: "/swing-dance-lessons",       label: "Swing",          desc: "Jive, East Coast, West Coast" },
  { key: "competition", href: "/competition-dance-lessons", label: "Competition",    desc: "Train to compete and win" },
];

export default async function HomePage() {
  const studios = await getAllStudios();
  const studioCount = studios.length;
  const countLabel = studioCount > 0 ? `${studioCount.toLocaleString()}+` : "900+";

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 60%, #2d1f0e 100%)" }}
      >
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#e8c560" }}>
            The Premier Dance Studio Directory
          </p>
          <h1 className="font-display text-white mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.15, fontWeight: 800 }}>
            Find Private Dance Lessons
            <span className="block" style={{ color: "#e8c560" }}>Near You</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto mb-12"
            style={{ fontSize: "1.1rem", lineHeight: 1.75 }}>
            Browse Fred Astaire, Arthur Murray, Dance With Me, and elite independent
            studios offering private instruction across the United States.
          </p>
          {/* Mobile: 1 col stacked → sm: 2×2 grid → lg: 3 inputs row + full-width button below */}
          <form action="/studios" method="GET"
            className={`${styles.form} grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl lg:w-3/4 mx-auto`}>
            <input type="text" name="q" placeholder="City or studio name…"
              className="px-5 py-4 rounded-lg text-gray-900 text-base bg-white
                         border-2 border-transparent focus:outline-none focus:border-yellow-400
                         placeholder:text-gray-400" />
            <input type="text" name="state" placeholder="State (e.g. TX)"
              className="px-5 py-4 rounded-lg text-gray-900 text-base bg-white
                         border-2 border-transparent focus:outline-none focus:border-yellow-400
                         placeholder:text-gray-400" />
            <select name="style"
              className="px-5 py-4 rounded-lg text-base bg-white text-gray-900
                         border-2 border-transparent focus:outline-none focus:border-yellow-400">
              <option value="">All Dance Styles</option>
              {DANCE_STYLES.map((s) => (
                <option key={s} value={s}>{STYLE_LABELS[s]}</option>
              ))}
            </select>
            <button type="submit"
              className={`${styles.button} px-8 py-4 rounded-lg font-bold text-gray-900 text-base
                         transition-all duration-200 hover:brightness-110 sm:col-span-2`}
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
              Find Studios
            </button>
          </form>
          <p className="mt-6 text-white/40 text-sm">{countLabel} elite studios listed across the United States</p>
        </div>
      </section>

      {/* Browse by Style */}
      <section className="py-20 px-6" style={{ background: "#f9f6f0" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#b8922a" }}>
              Browse by Style
            </p>
            <h2 className="font-display text-gray-900 font-bold"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              What Would You Like to Learn?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_STYLES.map((style) => (
              <Link key={style.key} href={style.href}
                className="group p-6 bg-white rounded-xl border border-gray-200
                           hover:border-yellow-400 hover:shadow-lg transition-all duration-200">
                <h3 className="font-display font-bold text-gray-900 text-xl mb-1
                               group-hover:text-yellow-700 transition-colors">
                  {style.label}
                </h3>
                <p className="text-gray-500 text-sm">{style.desc}</p>
                <p className="mt-3 text-xs font-bold tracking-wide uppercase" style={{ color: "#b8922a" }}>
                  Find Studios →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Chains */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#b8922a" }}>
              Featured Studio Networks
            </p>
            <h2 className="font-display text-gray-900 font-bold"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              America&apos;s Premier Dance Studio Brands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Fred Astaire Dance Studios", count: "200+", desc: "The gold standard in American ballroom dance education since 1947." },
              { name: "Arthur Murray Dance Studios", count: "280+", desc: "The world's most recognized name in dance instruction for over 100 years." },
              { name: "Dance With Me Studios",       count: "20+",  desc: "As seen on Dancing with the Stars. Premium instruction on the East Coast." },
            ].map((chain) => (
              <div key={chain.name} className="p-8 rounded-xl border border-gray-200" style={{ background: "#f9f6f0" }}>
                <div className="text-3xl font-display font-bold mb-1" style={{ color: "#b8922a" }}>{chain.count}</div>
                <div className="text-xs font-bold tracking-wide uppercase text-gray-400 mb-3">Locations</div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{chain.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{chain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Studio Spotlights — internal links for SEO + discovery */}
      <section className="py-20 px-6" style={{ background: "#f9f6f0" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#b8922a" }}>
              Studio Spotlights
            </p>
            <h2 className="font-display text-gray-900 font-bold"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              Highly Rated Independent Dance Studios
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              A sample of top-rated, independently owned studios from across the directory.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                slug: "frequency-dance-boulder",
                title: "Frequency Dance",
                city:  "Boulder, Colorado",
                rating: "4.6\u2605 (54 reviews)",
                blurb: "Private ballroom, Latin, tango, waltz, and foxtrot instruction for adults along Colorado's Front Range.",
              },
              {
                slug: "accolades-movement-project-bellevue",
                title: "Accolades Movement Project",
                city:  "Bellevue, Washington",
                rating: "5.0\u2605",
                blurb: "Personalized private dance lessons across the Seattle Eastside \u2014 Bellevue, Redmond, Kirkland, and Sammamish.",
              },
              {
                slug: "absolute-danz-ballroom-and-latin-menasha",
                title: "Absolute Danz Ballroom and Latin",
                city:  "Menasha, Wisconsin",
                rating: "5.0\u2605 (18 reviews)",
                blurb: "Private ballroom and Latin instruction serving Menasha, Appleton, Neenah, and the greater Fox Valley.",
              },
            ].map((s) => (
              <Link key={s.slug} href={`/studios/${s.slug}`}
                className="group p-7 bg-white rounded-xl border border-gray-200
                           hover:border-yellow-400 hover:shadow-lg transition-all duration-200 block">
                <p className="text-xs font-bold tracking-wide uppercase text-gray-400 mb-2">{s.city}</p>
                <h3 className="font-display font-bold text-gray-900 text-xl mb-2
                               group-hover:text-yellow-700 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm font-semibold mb-3" style={{ color: "#b8922a" }}>{s.rating}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{s.blurb}</p>
                <p className="mt-4 text-xs font-bold tracking-wide uppercase" style={{ color: "#b8922a" }}>
                  View Studio &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Private Lessons */}
      <section className="py-20 px-6" style={{ background: "#0c1428" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-4" style={{ color: "#e8c560" }}>
            Why Private Instruction
          </p>
          <h2 className="font-display text-white font-bold mb-6"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            The Difference Private Lessons Make
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Private dance instruction offers personalized attention, accelerated progress,
            and the flexibility to learn at your own pace — all with an instructor focused
            entirely on your technique and goals.
          </p>
          <Link href="/ballroom-dance-lessons"
            className="inline-block px-8 py-4 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
            Browse All Studios
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900 text-lg">Ballroom Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">America&apos;s premier resource for private dance instruction</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/ballroom-dance-lessons" className="hover:text-gray-900 transition-colors">Ballroom</Link>
            <Link href="/latin-dance-lessons"    className="hover:text-gray-900 transition-colors">Latin</Link>
            <Link href="/tango-dance-lessons"    className="hover:text-gray-900 transition-colors">Tango</Link>
            <Link href="/wedding-dance-lessons"  className="hover:text-gray-900 transition-colors">Wedding Dance</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
