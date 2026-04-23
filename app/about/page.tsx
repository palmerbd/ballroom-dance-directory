import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Ballroom Dance Directory is an independent consumer resource for finding private dance instruction studios across the United States. Learn about our mission and how we operate.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/about" },
};

export default function AboutPage() {
  return (
    <main style={{ background: "#f9f6f0", minHeight: "100vh" }}>
      {/* Header */}
      <section
        className="px-6 py-16"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>
            About
          </p>
          <h1 className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
            About Ballroom Dance Directory
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            An independent resource to help you find private dance instruction near you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10">

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">What We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ballroom Dance Directory is an independent, third-party online directory. We are not
              affiliated with, endorsed by, or sponsored by any dance studio franchise or brand
              listed on this site. We are not operated by Arthur Murray, Fred Astaire Dance Studios,
              Dance With Me Studios, or any other franchise organization.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are a consumer resource — built to make it easier for people to discover private
              dance instruction studios in their area, compare options, and connect with the studio
              that is right for them.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">How Our Listings Work</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Studio listings on this directory are compiled from publicly available sources,
              including Google Maps, state business registration databases, and direct outreach to
              individual studios. Basic factual information &mdash; studio name, address, phone number,
              hours of operation, and dance styles offered &mdash; is collected and displayed for each
              listing.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              All studio descriptions on this directory are original content written by our editorial
              team. We do not reproduce or adapt any text, photographs, or marketing materials from
              studio websites or franchise corporate sites.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Listings are marked as <strong>Unclaimed</strong> until a verified studio owner or
              authorized representative claims their profile. We encourage studio owners to claim
              their listing to ensure their information is accurate and up to date.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Trademark Notice</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Brand names such as &ldquo;Arthur Murray,&rdquo; &ldquo;Fred Astaire Dance Studios,&rdquo; and
              &ldquo;Dance With Me&rdquo; are registered trademarks of their respective owners. These names
              are used on this directory solely to identify individual studio locations and are not
              used in any way that implies affiliation, endorsement, or sponsorship by those brands.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We do not use franchise logos, wordmarks, or branded graphics. All trademarks are the
              property of their respective owners.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Accuracy & Updates</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We make reasonable efforts to ensure listing information is accurate, but studio hours,
              pricing, offerings, and contact details can change. Always contact a studio directly to
              confirm current information before visiting.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you are a studio owner and notice inaccurate information in your listing, please
              claim your listing or contact us and we will update it promptly.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Removal Requests</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Any studio owner, authorized representative, or franchise corporate office may request
              removal of a listing at any time. We will process all removal requests within 5
              business days. Removal requests do not require a legal basis &mdash; we honor all
              reasonable requests.
            </p>
            <p className="text-gray-600 leading-relaxed">
              To request removal or report an issue with a listing, please{" "}
              <Link href="/contact" className="underline" style={{ color: "#b8922a" }}>contact us</Link>.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions, listing corrections, removal requests, or partnership inquiries,
              please visit our{" "}
              <Link href="/contact" className="underline" style={{ color: "#b8922a" }}>contact page</Link>{" "}
              or email us directly. We respond to all inquiries within 2 business days.
            </p>
          </div>

        </div>
      </section>

      {/* Footer nav */}
      <section className="px-6 py-10 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/studios" className="hover:text-gray-900 transition-colors">Browse Studios</Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
        </div>
      </section>
    </main>
  );
}
