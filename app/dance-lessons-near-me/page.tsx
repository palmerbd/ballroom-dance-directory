import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Dance Lessons Near Me — Find Private Ballroom & Latin Studios in Your City",
  description:
    "Find dance lessons near you. Browse 4,000+ private ballroom, Latin, tango, salsa, swing, and wedding-dance studios across every major US city. Read reviews, compare ratings, and book lessons with top-rated local instructors.",
  alternates: {
    canonical: "https://www.ballroomdancedirectory.com/dance-lessons-near-me",
  },
  openGraph: {
    title: "Dance Lessons Near Me",
    description:
      "Find private dance lessons near you — ballroom, Latin, tango, salsa, swing, and wedding-dance instruction in every major US city.",
    type: "website",
  },
};

// Top US cities with strong studio coverage
const POPULAR_CITIES: Array<{ city: string; slug: string; state: string }> = [
  { city: "New York City",  slug: "new-york-city",  state: "NY" },
  { city: "Los Angeles",    slug: "los-angeles",    state: "CA" },
  { city: "Chicago",        slug: "chicago",        state: "IL" },
  { city: "Houston",        slug: "houston",        state: "TX" },
  { city: "Phoenix",        slug: "phoenix",        state: "AZ" },
  { city: "Philadelphia",   slug: "philadelphia",   state: "PA" },
  { city: "San Antonio",    slug: "san-antonio",    state: "TX" },
  { city: "San Diego",      slug: "san-diego",      state: "CA" },
  { city: "Dallas",         slug: "dallas",         state: "TX" },
  { city: "Austin",         slug: "austin",         state: "TX" },
  { city: "Atlanta",        slug: "atlanta",        state: "GA" },
  { city: "Boston",         slug: "boston",         state: "MA" },
  { city: "Seattle",        slug: "seattle",        state: "WA" },
  { city: "Denver",         slug: "denver",         state: "CO" },
  { city: "Miami",          slug: "miami",          state: "FL" },
  { city: "Nashville",      slug: "nashville",      state: "TN" },
  { city: "Portland",       slug: "portland",       state: "OR" },
  { city: "Las Vegas",      slug: "las-vegas",      state: "NV" },
  { city: "Minneapolis",    slug: "minneapolis",    state: "MN" },
  { city: "Orlando",        slug: "orlando",        state: "FL" },
];

// Style families with their hub pages
const STYLES: Array<{ name: string; slug: string; blurb: string }> = [
  { name: "Ballroom Dance Lessons",     slug: "ballroom-dance-lessons",     blurb: "Waltz, foxtrot, tango, Viennese waltz, and quickstep — the foundation of social and competitive ballroom." },
  { name: "Latin Dance Lessons",        slug: "latin-dance-lessons",        blurb: "Cha-cha, rumba, samba, bachata, and salsa — energetic Latin rhythms taught privately." },
  { name: "Tango Dance Lessons",        slug: "tango-dance-lessons",        blurb: "American and Argentine tango — passionate, expressive partner dance for all levels." },
  { name: "Swing Dance Lessons",        slug: "swing-dance-lessons",        blurb: "East Coast swing, Lindy Hop, and West Coast swing — fun, social, and beginner-friendly." },
  { name: "Wedding Dance Lessons",      slug: "wedding-dance-lessons",      blurb: "Choreographed first dances, parent dances, and wedding-party routines — for couples and bridal parties." },
  { name: "Competition Dance Lessons",  slug: "competition-dance-lessons",  blurb: "Pro/Am, Amateur, and Open competitive coaching — for dancers preparing for NDCA, USA Dance, and WDSF events." },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How do I find dance lessons near me?",
    a: "Use the city directory below to browse private dance studios in your metro area. Each city page lists local studios with verified ratings, reviews, contact information, and a breakdown of dance styles taught. You can also filter by style (ballroom, Latin, tango, swing, wedding) to find the right instructor for your goal.",
  },
  {
    q: "How much do private dance lessons cost?",
    a: "Private dance lessons in the United States typically range from $60 to $150 per hour, depending on the city, instructor experience, and studio. Many studios offer a discounted introductory lesson ($25–$50) to help new students get started. Group classes are usually $15–$30 per class.",
  },
  {
    q: "What kinds of dance lessons are available near me?",
    a: "Most major US cities have private instruction available in ballroom (waltz, foxtrot, tango, Viennese waltz, quickstep), Latin (cha-cha, rumba, samba, bachata, salsa), swing (East Coast, West Coast, Lindy Hop), Argentine tango, and wedding-dance choreography. Smaller cities may have fewer specialized options — the city pages below show exactly what is taught at each local studio.",
  },
  {
    q: "Are dance lessons good for adults and seniors?",
    a: "Yes. The majority of private dance students in the United States are adults — including beginners in their 60s, 70s, and 80s. Studios that offer adult-focused private instruction emphasize lesson plans calibrated to the student's pace, mobility, and goals (social dance, wedding preparation, or competitive performance), without the pressure of a group class.",
  },
  {
    q: "Can I find dance lessons for my wedding first dance?",
    a: "Yes — most private studios offer dedicated wedding-dance lesson packages, including choreographed first dances, parent dances, and bridal-party routines. Couples typically book 4–10 lessons leading up to the wedding. See the wedding-dance lessons hub linked below for studios that specialize in this.",
  },
  {
    q: "How do I choose between dance studios in my area?",
    a: "When comparing local studios, check verified Google review counts and ratings, ask whether instructors are certified by a national body (NDCA, NDTA, USA Dance, or Arthur Murray's internal program), and book a paid intro lesson before committing to a package. Studio websites and the Ballroom Dance Directory listings include phone, hours, dance-style coverage, and recent reviews to help you decide.",
  },
];

export default function DanceLessonsNearMePage() {
  // JSON-LD FAQPage schema for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main>
        {/* Hero */}
        <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2547 100%)" }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-4" style={{ color: "#e8c560" }}>
              Find Local Dance Studios
            </p>
            <h1 className="font-display text-white font-bold mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Dance Lessons Near Me
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Find private ballroom, Latin, tango, salsa, swing, and wedding-dance lessons near you. Our directory covers 4,000+ studios across every major US city — with verified ratings, real reviews, and full contact details.
            </p>
            <div className="mt-10">
              <Link href="/cities"
                className="inline-block px-8 py-4 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                Browse All Cities
              </Link>
            </div>
          </div>
        </section>

        {/* Popular cities */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#b8922a" }}>
                By City
              </p>
              <h2 className="font-display text-gray-900 font-bold"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
                Dance Lessons in Your City
              </h2>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                Tap your nearest metro area to see every private dance studio in the city — ratings, reviews, hours, and the styles each studio teaches.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {POPULAR_CITIES.map((c) => (
                <Link key={c.slug} href={`/studios/city/${c.slug}`}
                  className="group p-4 bg-gray-50 rounded-lg border border-gray-200
                             hover:border-yellow-400 hover:shadow-sm transition-all duration-200 block text-center">
                  <p className="font-display font-bold text-gray-900 text-sm
                                group-hover:text-yellow-700 transition-colors">
                    Dance Lessons in {c.city}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{c.state}</p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/cities" className="text-sm font-semibold" style={{ color: "#b8922a" }}>
                See all cities &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* By dance style */}
        <section className="py-16 px-6" style={{ background: "#f9f6f0" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#b8922a" }}>
                By Dance Style
              </p>
              <h2 className="font-display text-gray-900 font-bold"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
                Lessons Near You, by Style
              </h2>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                Already know what you want to learn? Jump straight to a style hub — each links to local studios that specialize in that form.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {STYLES.map((s) => (
                <Link key={s.slug} href={`/${s.slug}`}
                  className="group p-6 bg-white rounded-xl border border-gray-200
                             hover:border-yellow-400 hover:shadow-md transition-all duration-200 block">
                  <h3 className="font-display font-bold text-gray-900 text-xl mb-2
                                 group-hover:text-yellow-700 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.blurb}</p>
                  <p className="mt-3 text-xs font-bold tracking-wide uppercase" style={{ color: "#b8922a" }}>
                    Browse Studios &rarr;
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#b8922a" }}>
                Frequently Asked
              </p>
              <h2 className="font-display text-gray-900 font-bold"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
                Questions About Finding Dance Lessons Near You
              </h2>
            </div>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q} className="p-6 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{f.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-20 px-6" style={{ background: "#0c1428" }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-white font-bold mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              Ready to find dance lessons near you?
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Browse 4,000+ verified studios, compare ratings, and contact instructors directly. No accounts, no friction — just the local studios you&apos;re looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cities"
                className="inline-block px-8 py-4 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}>
                Browse by City
              </Link>
              <Link href="/styles"
                className="inline-block px-8 py-4 rounded-lg font-bold text-white border-2 border-white/30 transition-all hover:bg-white/10">
                Browse by Style
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
