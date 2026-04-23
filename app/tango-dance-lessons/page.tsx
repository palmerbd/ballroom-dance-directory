import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tango Dance Lessons — Find Private Instruction Near You",
  description:
    "Find private tango dance lesson studios near you. Argentine Tango, Ballroom Tango, and more. Browse expert studios offering one-on-one tango instruction.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/tango-dance-lessons" },
};

const FAQ = [
  {
    q: "What is the difference between Argentine Tango and Ballroom Tango?",
    a: "Argentine Tango is an improvisational, deeply connected partner dance with roots in Buenos Aires. Ballroom Tango is the competition/performance form with a more staccato character, sharp head movements, and a structured syllabus. Many studios teach both.",
  },
  {
    q: "Is tango hard to learn as a beginner?",
    a: "Tango has a reputation for difficulty because its connection and improvisation are subtle. But the basics are accessible to any beginner with a good instructor. Private lessons are especially valuable for tango because the lead-follow connection is very personal.",
  },
  {
    q: "How long does it take to learn tango?",
    a: "Most students can learn basic tango footwork and connection in 5–10 private lessons. Social dancing comfort typically develops over 20–30 lessons. The depth of tango means there is always more to explore even for advanced dancers.",
  },
  {
    q: "Do I need prior dance experience to learn tango?",
    a: "No prior experience is needed. Tango studios regularly welcome absolute beginners. In fact, some instructors prefer teaching beginners because there are no bad habits to unlearn.",
  },
];

const OTHER_STYLES = [
  { label: "Ballroom", href: "/ballroom-dance-lessons" },
  { label: "Latin Dance", href: "/latin-dance-lessons" },
  { label: "Wedding Dance", href: "/wedding-dance-lessons" },
  { label: "Swing Dance", href: "/swing-dance-lessons" },
  { label: "Competition", href: "/competition-dance-lessons" },
];

export default async function TangoDanceLessonsPage() {
  const allStudios = await getAllStudios(100);
  const studios = allStudios.filter((s) => s.danceStyles.includes("tango" as any));
  const cities = [...new Set(studios.map((s) => s.city).filter(Boolean))].sort();

  return (
    <main>
      <section className="px-6 py-20"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>Dance Style Guide</p>
          <h1 className="font-display text-white font-bold mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>Tango Dance Lessons</h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            The most dramatic and intimate of all partner dances. Find private tango instruction
            at top studios and experience the connection that makes tango legendary.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/studios?style=tango"
              className="px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
              Browse Tango Studios
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
            <h2 className="font-display font-bold text-gray-900 text-2xl mb-5">The Art of Tango</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Tango is the dance of passion, precision, and presence. Born in the working-class
              neighborhoods of Buenos Aires in the late 19th century, tango has evolved into both a
              deeply personal social dance and a dramatically stylized performance art. It demands full
              attention &mdash; to your partner, to the music, and to the floor beneath you.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Private tango instruction is the most effective path for beginners and experienced dancers
              alike. The nuances of lead and follow, the walk, the embrace, and the improvised dialogue
              between partners require personalized coaching that group classes simply cannot replicate.
            </p>
            <h3 className="font-display font-bold text-gray-900 text-xl mt-8 mb-4">Styles You&apos;ll Explore</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Argentine Tango", "Ballroom Tango", "Tango Milonguero", "Neo Tango", "Tango Nuevo"].map((style) => (
                <div key={style} className="px-4 py-3 rounded-lg border text-sm font-semibold text-center"
                  style={{ borderColor: "#b8922a", color: "#7a5f1a", background: "#fdf8f0" }}>{style}</div>
              ))}
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
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">Tango Studios</h2>
          <p className="text-gray-500 text-sm mb-8">{studios.length} studios offering tango instruction</p>
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
              <Link href="/studios?style=tango"
                className="inline-block px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                View All {studios.length} Tango Studios
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
