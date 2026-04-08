import { Metadata } from "next";
import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Competition Dance Lessons — Train to Compete Near You",
  description:
    "Find private competition dance training studios near you. Ballroom, Latin, and formation competition coaching from expert instructors at top-rated studios.",
};

const FAQ = [
  {
    q: "What competitions can I enter as a beginner?",
    a: "Most competitions have a Bronze or Newcomer level for students with less than one year of experience. Many studios run in-house showcases as a first step before entering open competitions like USA Dance events or franchise-affiliated competitions.",
  },
  {
    q: "How much does competition training cost?",
    a: "Competition preparation involves more intensive private lessons than social dance training, which increases cost. Expect $100–$200+ per private lesson at competition-focused studios. Competition fees, costumes, and travel are additional costs your instructor can help you plan for.",
  },
  {
    q: "Do I compete with my instructor or with a partner?",
    a: "Both options exist. Pro-am competition (student with instructor) is the most common structure at franchise-affiliated studios. Amateur competition (student with another student) is also available and is required at some events.",
  },
  {
    q: "How long does it take to be ready for a competition?",
    a: "With consistent private lessons, most motivated students can prepare for a newcomer or bronze level competition in 6–12 months. Your instructor will tell you honestly when you are ready.",
  },
  {
    q: "What should I look for in a competition dance studio?",
    a: "Look for instructors with personal competition experience, a track record of preparing students for events, and an honest assessment process. A good competition coach will push you constructively and celebrate every small improvement.",
  },
];

const OTHER_STYLES = [
  { label: "Ballroom", href: "/ballroom-dance-lessons" },
  { label: "Latin Dance", href: "/latin-dance-lessons" },
  { label: "Tango", href: "/tango-dance-lessons" },
  { label: "Wedding Dance", href: "/wedding-dance-lessons" },
  { label: "Swing Dance", href: "/swing-dance-lessons" },
];

export default async function CompetitionDanceLessonsPage() {
  const allStudios = await getAllStudios(100);
  const studios = allStudios.filter((s) => s.danceStyles.includes("competition" as any));
  const cities = [...new Set(studios.map((s) => s.city).filter(Boolean))].sort();

  return (
    <main>
      <section className="px-6 py-20"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>Competition Training</p>
          <h1 className="font-display text-white font-bold mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>Competition Dance Training</h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Train with instructors who know what it takes to compete. Find competition-focused
            dance studios near you and start your journey from the studio floor to the competition floor.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/studios?style=competition"
              className="px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
              Browse Competition Studios
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
            <h2 className="font-display font-bold text-gray-900 text-2xl mb-5">From Studio Floor to Competition Floor</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ballroom and Latin dance competition is one of the most demanding and rewarding athletic
              pursuits in the world. Competitors must master technique, musicality, performance
              presence, stamina, and the ability to execute under pressure &mdash; often in front of
              panels of expert judges.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              The right competition coach makes all the difference. Studios that specialize in
              competition training have instructors who have competed themselves, who understand
              judging criteria, and who know how to build a student&apos;s skills systematically
              from Bronze through Gold and beyond.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Competition training sharpens every aspect of your dancing even if you never enter
              a competition. Many students train at a competition level simply because the instruction
              is more precise and the progress is faster.
            </p>
            <h3 className="font-display font-bold text-gray-900 text-xl mt-8 mb-4">Competition Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Smooth", "Standard", "Rhythm", "Latin", "American Smooth", "Pro-Am"].map((cat) => (
                <div key={cat} className="px-4 py-3 rounded-lg border text-sm font-semibold text-center"
                  style={{ borderColor: "#b8922a", color: "#7a5f1a", background: "#fdf8f0" }}>{cat}</div>
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
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">Competition Training Studios</h2>
          <p className="text-gray-500 text-sm mb-8">{studios.length} studios offering competition training</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {studios.slice(0, 12).map((studio) => (
              <Link key={studio.slug} href={`/studios/${studio.slug}`}
                className="block rounded-xl border border-gray-200 p-5 hover:border-yellow-400 hover:shadow-md transition-all group">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-yellow-700 transition-colors mb-2">{studio.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{studio.city}{studio.city && studio.state ? ", " : ""}{studio.state}</p>
                {studio.rating && (
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
              <Link href="/studios?style=competition"
                className="inline-block px-6 py-3 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                View All {studios.length} Competition Studios
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
