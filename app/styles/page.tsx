import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";
import { DanceStyle } from "@/types/studio";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Browse Studios by Dance Style | Ballroom Dance Directory",
  description:
    "Find private dance studios by style — ballroom, Latin, tango, salsa, swing, wedding dance, and more. Browse 4,000+ studios filtered by your preferred dance style.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/styles" },
};

// The 7 styles shown on this page, in display order
const STYLES_PAGE_ORDER: DanceStyle[] = [
  "ballroom", "latin", "swing", "country",
  "wedding_dance", "competition", "social_latin",
];

// Style metadata: label override, description, emoji, CTA label, href, and colors
const STYLE_META: Partial<Record<DanceStyle, {
  label: string; ctaLabel: string; desc: string;
  emoji: string; href: string; color: string; bg: string;
}>> = {
  ballroom: {
    label:    "American Smooth / Ballroom / Standard",
    ctaLabel: "Ballroom",
    desc:     "Waltz, Tango, Foxtrot, Viennese Waltz, Quickstep — elegant partner dancing, flowing, romantic and timeless.",
    emoji:    "🥂",
    href:     "/ballroom-dance-lessons",
    color:    "#1e3a8a",
    bg:       "#dbeafe",
  },
  latin: {
    label:    "Latin / Rhythm",
    ctaLabel: "Latin",
    desc:     "Rumba, Cha Cha, Samba, East Coast Swing, Bolero, Paso Doble, Jive, Mambo — high energy, passion on the dance floor!",
    emoji:    "🌶️",
    href:     "/latin-dance-lessons",
    color:    "#7f1d1d",
    bg:       "#fee2e2",
  },
  swing: {
    label:    "Swing",
    ctaLabel: "Swing",
    desc:     "Hustle, West Coast Swing, East Coast Swing, Lindy Hop — playful, lively dances rooted in jazz and rock & roll.",
    emoji:    "🎷",
    href:     "/swing-dance-lessons",
    color:    "#78350f",
    bg:       "#fef3c7",
  },
  country: {
    label:    "Country",
    ctaLabel: "Country",
    desc:     "Two-step, line dances, Country Waltz, Country Polka and more — break out your boots and cowboy hats and get ready to boogie!",
    emoji:    "🤠",
    href:     "/studios?style=country",
    color:    "#6b4226",
    bg:       "#fdf3e3",
  },
  wedding_dance: {
    label:    "Wedding Dance",
    ctaLabel: "Wedding Dance",
    desc:     "Perfect your first dance. Studios specializing in wedding choreography and bridal packages.",
    emoji:    "💍",
    href:     "/wedding-dance-lessons",
    color:    "#831843",
    bg:       "#fce7f3",
  },
  competition: {
    label:    "Competition",
    ctaLabel: "Competition",
    desc:     "Train for dance competitions. Studios offering medal programs, showcase, and competitive coaching.",
    emoji:    "🏆",
    href:     "/competition-dance-lessons",
    color:    "#92400e",
    bg:       "#fef3c7",
  },
  social_latin: {
    label:    "Social Latin Dances",
    ctaLabel: "Social Latin",
    desc:     "Salsa, Bachata, Merengue, Cumbia, Argentine Tango — fast, fun and social. Some of the most popular dances in the world.",
    emoji:    "💃",
    href:     "/studios?style=social_latin",
    color:    "#065f46",
    bg:       "#d1fae5",
  },
};

export default async function StylesPage() {
  // Get studio counts per style
  const all = await getAllStudios(100);
  const styleCounts: Record<string, number> = {};
  for (const studio of all) {
    for (const style of studio.danceStyles) {
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    }
  }

  const totalStudios = all.length;

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-6xl mx-auto">
          <nav className="text-sm mb-6">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/80">Browse by Style</span>
          </nav>
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#e8c560" }}>
            Find Your Style
          </p>
          <h1
            className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Browse Studios by Dance Style
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {totalStudios.toLocaleString()} studios across {STYLES_PAGE_ORDER.length} dance styles —
            click a style to see all studios that teach it.
          </p>
        </div>
      </section>

      {/* ── Style Grid ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: "#f9f6f0" }}>
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STYLES_PAGE_ORDER.map((style) => {
              const meta  = STYLE_META[style]!;
              const count = styleCounts[style] || 0;

              return (
                <Link
                  key={style}
                  href={meta.href}
                  className="group relative bg-white rounded-2xl border border-gray-200
                             hover:border-yellow-400 hover:shadow-xl transition-all duration-200
                             overflow-hidden flex flex-col"
                >
                  {/* Color accent bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${meta.color}66, ${meta.color})` }}
                  />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon + title row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-3xl block mb-2">{meta.emoji}</span>
                        <h2
                          className="font-display font-bold text-xl group-hover:text-yellow-800 transition-colors"
                          style={{ color: "#111" }}
                        >
                          {meta.label}
                        </h2>
                      </div>
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-1 shrink-0"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {count.toLocaleString()} studios
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
                      {meta.desc}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-1 font-bold text-sm transition-colors"
                         style={{ color: "#b8922a" }}>
                      Browse {meta.ctaLabel} Studios
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                           fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── All Styles at a Glance ──────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-gray-900 text-xl mb-6">Not sure which style is right for you?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="font-bold text-gray-900 mb-2">For Beginners</div>
              <p>
                Start with <strong>Ballroom</strong> or <strong>Swing</strong> — both are welcoming to newcomers,
                social, and broadly taught. Many studios offer intro packages specifically for first-timers.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="font-bold text-gray-900 mb-2">For Couples & Weddings</div>
              <p>
                <strong>Wedding Dance</strong> studios specialize in first-dance choreography.
                <strong> Waltz</strong> and <strong>Foxtrot</strong> are elegant and popular choices for formal events.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="font-bold text-gray-900 mb-2">For Competitive Dancers</div>
              <p>
                Look for <strong>Competition</strong> studios with medal programs and DanceSport coaching.
                <strong> Latin</strong> and <strong>Tango</strong> are common on the competitive circuit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-display font-bold text-gray-900">Ballroom Dance Directory</div>
            <p className="text-gray-400 text-sm mt-1">America&apos;s premier resource for private dance instruction</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
            <Link href="/cities" className="hover:text-gray-900 transition-colors">Browse by City</Link>
            <Link href="/claim" className="hover:text-gray-900 transition-colors">Claim Studio</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
