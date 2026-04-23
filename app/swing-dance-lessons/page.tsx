import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Swing Dance Lessons — Find Private Instruction Near You",
  description:
    "Find private swing dance lesson studios near you. East Coast Swing, West Coast Swing, Lindy Hop, Jive, and more. Browse top-rated studios.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/swing-dance-lessons" },
};

const FAQ = [
  {
    q: "What are the different types of swing dance?",
    a: "The main styles are East Coast Swing (the most common beginner style), West Coast Swing (smooth, slot-based, highly musical), Lindy Hop (the original Harlem swing from the 1930s), and Jive (a faster, bouncier version common in ballroom competition). Many studios teach multiple styles.",
  },
  {
    q: "Is swing dance good for beginners?",
    a: "East Coast Swing is one of the most beginner-friendly partner dances there is. The 6-count basic can be learned in a single lesson. Most people leave their first swing lesson feeling like they actually danced.",
  },
  {
    q: "Can I learn swing dance without a partner?",
    a: "Yes. Private lessons pair you with an instructor, and group classes rotate partners. You do not need to bring anyone with you.",
  },
  {
    q: "What is the difference between East Coast and West Coast Swing?",
    a: "East Coast Swing is circular and energetic, with a bouncy, rock-step rhythm. West Coast Swing is linear (danced in a slot), smoother, and can be danced to a huge range of music from blues to pop to hip-hop. WCS is particularly popular on the social dance scene.",
  },
];

const OTHER_STYLES = [
  { label: "Ballroom", href: "/ballroom-dance-lessons" },
  { label: "Latin Dance", href: "/latin-dance-lessons" },
  { label: "Tango", href: "/tango-dance-lessons" },
  { label: "Wedding Dance", href: "/wedding-dance-lessons" },
  { label: "Competition", href: "/competition-dance-lessons" },
];

export default async function SwingDanceLessonsPage() {
  const allStudios = await getAllStudios(100);
  const studios = allStudios.filter((s) => s.danceStyles.includes("swing" as any));
  const cities = [...new Set(studios.map((s) => s.city).filter(Boolean))].sort();

  return (
    <main>
      <section className="px-6 py-20"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>Dance Style Guide</p>
          <h1 className="font-display text-white font-bold mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>Swing Dance Lessons</h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            High-energy, joyful, and endlessly social. Find private swing dance instruction near
            you and discover why swing never went out of style.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/studios?style=swing"
              className="px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
              Browse Swing Studios
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
            <h2 className="font-display font-bold text-gray-900 text-2xl mb-5">The Joy of Swing Dance</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Swing dance has been bringing people together since the 1920s, and it shows no signs of
              slowing down. It&apos;s one of the most joyful forms of social dancing &mdash; upbeat, improvisational,
              and accessible to dancers of all ages and backgrounds.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Private swing lessons move much faster than group classes because the instruction is
              laser-focused on your specific footwork, lead/follow skills, and musicality. Whether you
              are preparing for a social dance scene, a wedding, or simply want a new hobby, swing
              dance studios offer some of the most welcoming communities in partner dance.
            </p>
            <h3 className="font-display font-bold text-gray-900 text-xl mt-8 mb-4">Styles You&apos;ll Learn</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["East Coast Swing", "West Coast Swing", "Lindy Hop", "Jive", "Boogie Woogie", "Carolina Shag"].map((style) => (
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
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">Swing Dance Studios</h2>
          <p className="text-gray-500 text-sm mb-8">{studios.length} studios offering swing instruction</p>
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
              <Link href="/studios?style=swing"
                className="inline-block px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                View All {studios.length} Swing Studios
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
