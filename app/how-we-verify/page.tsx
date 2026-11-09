import type { Metadata } from "next";
import Link from "next/link";

// ─── /how-we-verify ───────────────────────────────────────────────────────────
// The method behind every listing: verification levels, where each fact comes
// from, how Featured works, independence, corrections. Keep this page truthful to
// what is actually live; mark anything still rolling out as such.

const UPDATED = "November 9, 2026";

export const metadata: Metadata = {
  title: "How We Verify Studio Listings",
  description:
    "What Ballroom Dance Directory checks on each dance studio listing, where every fact comes from, how often we re-check it, and how Featured listings and corrections work.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/how-we-verify" },
};

const LEVELS = [
  {
    name: "Listed",
    tone: { bg: "#f3f4f6", fg: "#4b5563" },
    status: "Most listings today",
    what: "Basic facts from public business listing data, mostly Google Maps: name, address, phone and hours. We haven't checked these yet.",
    shows: "Dance styles on these listings are labelled “listed”, not confirmed. Each listing shows when its details were last updated.",
  },
  {
    name: "Checked",
    tone: { bg: "#eff6ff", fg: "#1e3a8a" },
    status: "Rolling out city by city, starting with Fort Worth (November 2026)",
    what: "We read the studio's own website. We confirm it's still open and its phone number matches, and we record which styles it teaches, whether it teaches adults, its intro offer, and whether you can book or pay online.",
    shows: "Each fact shows the date we checked it. We re-check monthly.",
  },
  {
    name: "Tested",
    tone: { bg: "#fdf4e3", fg: "#7a5c18" },
    status: "Fort Worth pilot under way",
    what: "We contact the studio the way a new student would, by web inquiry and a business-hours call, and record whether and how fast it replies and what intro offer it quotes. We say who we are when we ask.",
    shows: "When a city's test is finished, reply times and test dates appear on each tested listing and in Dance Booking Rank.",
  },
  {
    name: "Owner-confirmed",
    tone: { bg: "#ecfdf5", fg: "#047857" },
    status: "Live for claimed listings",
    what: "The studio's owner has claimed the listing, verified their email address, and our team has approved the claim.",
    shows: "The owner can update their details and answer questions for dancers in their own words, shown with their first name and the date.",
  },
];

const FACTS: { fact: string; source: string; label: string }[] = [
  { fact: "Address, phone, hours", source: "Public business listing data until checked; the studio's own site or owner after that", label: "“Details last updated” date" },
  { fact: "Dance styles", source: "Listed: public data. Checked: the studio's own class pages. Owner-confirmed: the owner", label: "“Dance styles listed” until checked, then “offered”" },
  { fact: "Intro offer and prices", source: "The studio's own website, copied as published", label: "The date we read it" },
  { fact: "Books online", source: "Yes if the studio's site lets you book a lesson or class online without calling", label: "Yes / No / Not checked yet" },
  { fact: "Pays online", source: "Yes if you can pay for a lesson, package or intro offer on the studio's site", label: "Yes / No / Not checked yet" },
  { fact: "Reply time", source: "Our own new-student inquiry, timed from sending to the first reply", label: "Tested studios only, with the test date" },
  { fact: "From the Owner", source: "Written by the studio owner", label: "Owner's first name and the date" },
];

export default function HowWeVerifyPage() {
  return (
    <main style={{ background: "#f9f6f0", minHeight: "100vh" }}>
      {/* Header */}
      <section className="px-6 py-16" style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>Our method</p>
          <h1 className="font-display text-white font-bold mb-4" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
            How We Verify Studio Listings
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Every fact on a listing should say where it came from and when. Here is what we check, how often,
            and what we don&apos;t.
          </p>
        </div>
      </section>

      <div className="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Levels */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-2">Four verification levels</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Each listing shows its level. A fact we haven&apos;t checked is shown as not checked, never guessed.
            </p>
            <ol className="space-y-5">
              {LEVELS.map((l, i) => (
                <li key={l.name} className="rounded-lg border border-gray-100 p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: l.tone.bg, color: l.tone.fg }}>{i + 1}</span>
                    <h3 className="font-semibold text-gray-900 text-lg">{l.name}</h3>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: l.tone.bg, color: l.tone.fg }}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{l.what}</p>
                  <p className="text-sm text-gray-500 mt-2">{l.shows}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Sources */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 pb-4">
              <h2 className="font-display font-bold text-gray-900 text-xl mb-2">Where each fact comes from</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-8 py-3">Fact</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-8 py-3">How it&apos;s labelled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FACTS.map((f) => (
                    <tr key={f.fact} className="align-top">
                      <td className="px-8 py-4 font-medium text-gray-900">{f.fact}</td>
                      <td className="px-4 py-4 text-gray-700">{f.source}</td>
                      <td className="px-8 py-4 text-gray-600">{f.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* What we don't do */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">What we don&apos;t do</h2>
            <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-5">
              <li>We don&apos;t copy text from studio websites. Descriptions appear only when an owner writes or approves them.</li>
              <li>We don&apos;t rate teaching quality. Dance Booking Rank measures how easy a studio is to find online, not how well it teaches.</li>
              <li>We don&apos;t sell rankings or verification levels.</li>
            </ul>
          </section>

          {/* Featured + independence */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Featured listings and independence</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Featured is a paid plan for studios. It adds a lead form, the studio&apos;s own photos and description,
              and priority placement in search results, and it is always labelled. It never changes a studio&apos;s
              verification level, the facts we publish about it, or its Dance Booking Rank score.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ballroom Dance Directory is run by the team behind BookDanceLessons, which sells marketing services to
              dance studios. Some studios we list may be its clients. That doesn&apos;t change what we check or what
              we publish.
            </p>
          </section>

          {/* Original data */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Data we publish</h2>
            <p className="text-gray-700 leading-relaxed">
              What we gather becomes city reports anyone can use. The first is{" "}
              <Link href="/lesson-prices/fort-worth-tx" className="underline" style={{ color: "#9a7620" }}>
                what ballroom lessons cost in Fort Worth
              </Link>
              , read from 12 studios&apos; own websites.
            </p>
          </section>

          {/* Corrections */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Corrections</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              See something wrong? Email{" "}
              <a href="mailto:info@ballroomdancedirectory.com?subject=Listing%20correction" className="underline" style={{ color: "#9a7620" }}>
                info@ballroomdancedirectory.com
              </a>{" "}
              with the studio&apos;s name and what&apos;s wrong. We aim to fix factual errors within two business days.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Studio owners can{" "}
              <Link href="/claim" className="underline" style={{ color: "#9a7620" }}>claim their listing</Link>{" "}
              to update it themselves, or{" "}
              <Link href="/login" className="underline" style={{ color: "#9a7620" }}>sign in</Link> if they already have.
            </p>
          </section>

          <p className="text-center text-xs text-gray-400">This page was last updated {UPDATED}.</p>
        </div>
      </div>

      {/* Footer nav */}
      <section className="px-6 py-10 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
        </div>
      </section>
    </main>
  );
}
