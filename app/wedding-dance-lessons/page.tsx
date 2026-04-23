import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Wedding Dance Lessons — First Dance Instruction Near You",
  description:
    "Find private wedding dance lesson studios near you. Make your first dance unforgettable with expert one-on-one instruction. Browse top-rated studios.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/wedding-dance-lessons" },
};

const FAQ = [
  {
    q: "How many lessons do I need before my wedding?",
    a: "Most couples take 5–10 private lessons to feel confident in their first dance. Starting 2–3 months before the wedding gives plenty of time to learn the dance and run through it until it feels natural, without pressure.",
  },
  {
    q: "What song should I choose for my first dance?",
    a: "Choose a song that means something to you as a couple. Your instructor will help you choose a dance style (Waltz, Foxtrot, Rumba, etc.) that fits the tempo and feel of your song. Bring a few options to your first lesson.",
  },
  {
    q: "What if neither of us has ever danced before?",
    a: "That is exactly what most couples say when they first call. Wedding dance lessons are designed for non-dancers. By your wedding day, you will look comfortable, confident, and like you planned the whole thing.",
  },
  {
    q: "Can we do something other than a slow dance?",
    a: "Absolutely. Many couples are choosing upbeat first dances &mdash; a Foxtrot, a Salsa, or even a choreographed surprise with a song change. Talk to your instructor about what fits your personality.",
  },
  {
    q: "How far in advance should we book lessons?",
    a: "Book at least 2–3 months before the wedding. Studios get busy with wedding season, especially in spring and fall. 6 months out is ideal if you want more polish or a choreographed performance routine.",
  },
];

const OTHER_STYLES = [
  { label: "Ballroom", href: "/ballroom-dance-lessons" },
  { label: "Latin Dance", href: "/latin-dance-lessons" },
  { label: "Tango", href: "/tango-dance-lessons" },
  { label: "Swing Dance", href: "/swing-dance-lessons" },
  { label: "Competition", href: "/competition-dance-lessons" },
];

export default async function WeddingDanceLessonsPage() {
  const allStudios = await getAllStudios(100);
  const studios = allStudios.filter((s) => s.danceStyles.includes("wedding_dance" as any));
  const cities = [...new Set(studios.map((s) => s.city).filter(Boolean))].sort();

  return (
    <main>
      <section className="px-6 py-20"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>Wedding Dance</p>
          <h1 className="font-display text-white font-bold mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>Wedding Dance Lessons</h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Your first dance deserves to be unforgettable. Find expert wedding dance instruction
            at studios near you and walk onto the floor with total confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/studios?style=wedding_dance"
              className="px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
              Find Wedding Dance Studios
            </Link>
            <Link href="/studios"
              className="px-6 py-3 rounded-lg font-semibold text-white/80 border border-white/20 hover:border-white/50 transition-all">
              All Studios
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16" style={{ background: "#f9f6f0" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-gray-900 text-2xl mb-5">Your Perfect First Dance</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The first dance is one of the most watched moments of any wedding. Every eye in the room
              is on you for two to three minutes &mdash; and for most couples, that thought is terrifying
              until they walk into their first lesson.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Private wedding dance lessons give you and your partner a choreographed routine or a set
              of comfortable, natural movements that match your song perfectly. Your instructor tailors
              every detail &mdash; from footwork to posture to when you look at each other &mdash; so
              that your first dance tells your story.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Studios that specialize in wedding dances have seen every level of dancer and every kind
              of song. Whether you want a simple, elegant Waltz or a show-stopping choreographed
              performance, they will get you there.
            </p>
            <div className="mt-8 p-5 rounded-xl border-l-4 bg-white" style={{ borderColor: "#b8922a" }}>
              <p className="text-sm font-semibold text-gray-700 mb-1">Pro Tip</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Book your lessons as early as possible. Studios in popular wedding markets fill up
                fast in spring and fall. Starting early also means less stress and more polish by
                the big day.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 mb-3">Studios by City</h3>
              <ul className="space-y-2">
                {cities.slice(0, 8).map((city) => (
                  <li key={city}><Link href={`/studios/city/${city.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm hover:underline" style={{ color: "#b8922a" }}>{city}</Link></li>
                ))}
              </ul>
              <Link href="/studios" className="block mt-4 text-xs text-gray-400 hover:text-gray-700">View all cities →</Link>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 mb-3">Other Dance Styles</h3>
              <ul className="space-y-2 text-sm">
                {OTHER_STYLES.map((link) => (
                  <li key={link.href}><Link href={link.href} className="hover:underline" style={{ color: "#b8922a" }}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">Wedding Dance Studios</h2>
          <p className="text-gray-500 text-sm mb-8">{studios.length} studios offering wedding dance instruction</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {studios.slice(0, 12).map((studio) => (
              <Link key={studio.slug} href={`/studios/${studio.slug}`}
                className="block rounded-xl border border-gray-200 p-5 hover:border-yellow-400 hover:shadow-md transition-all group">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-yellow-700 transition-colors mb-2">{studio.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{studio.city}{studio.city && studio.state ? ", " : ""}{studio.state}</p>
                {studio.tier !== "free" && studio.rating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm" style={{ color: "#e8c560" }}>{"\u2605"}</span>
                    <span className="text-sm font-semibold text-gray-700">{studio.rating.toFixed(1)}</span>
                    {studio.reviewCount && <span className="text-xs text-gray-400">({studio.reviewCount})</span>}
                  </div>
                )}
              </Link>
            ))}
          </div>
          {studios.length > 12 && (
            <div className="mt-8 text-center">
              <Link href="/studios?style=wedding_dance"
                className="inline-block px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                View All {studios.length} Wedding Dance Studios
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-16" style={{ background: "#f9f6f0" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-8">Frequently Asked Questions</h2>
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

      <section className="px-6 py-10 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/studios" className="hover:text-gray-900 transition-colors">All Studios</Link>
          {OTHER_STYLES.map((l) => <Link key={l.href} href={l.href} className="hover:text-gray-900 transition-colors">{l.label}</Link>)}
        </div>
      </section>
    </main>
  );
}
