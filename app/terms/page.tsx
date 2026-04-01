import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Ballroom Dance Directory — an independent online dance studio directory.",
};

const EFFECTIVE_DATE = "April 1, 2026";

export default function TermsPage() {
  return (
    <main style={{ background: "#f9f6f0", minHeight: "100vh" }}>
      {/* Header */}
      <section
        className="px-6 py-16"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>
            Legal
          </p>
          <h1 className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
            Terms of Service
          </h1>
          <p className="text-white/50 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-8">

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Note:</strong> These Terms of Service are a working draft and have not yet been
              reviewed by legal counsel. They should be treated as a placeholder until attorney-reviewed
              terms are in place prior to the launch of the custom domain.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6 text-gray-600 leading-relaxed">

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Ballroom Dance Directory (&ldquo;the Site&rdquo;), you agree to be bound
                by these Terms of Service. If you do not agree, please do not use the Site.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">2. Independent Directory</h2>
              <p>
                Ballroom Dance Directory is an independent, third-party online directory. We are not
                affiliated with, endorsed by, or sponsored by any dance studio franchise or brand
                listed on this site, including but not limited to Arthur Murray International, Fred
                Astaire Dance Studios, or Dance With Me Studios. All trademarks are the property of
                their respective owners.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">3. Accuracy of Information</h2>
              <p className="mb-3">
                Listing information on this Site is compiled from publicly available sources and is
                provided for informational purposes only. We do not guarantee the accuracy,
                completeness, or currentness of any listing. Studio hours, pricing, contact
                information, and service offerings are subject to change.
              </p>
              <p>
                You should independently verify all information by contacting the studio directly
                before visiting or making any purchasing decisions.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">4. Use of the Site</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Use the Site for any unlawful purpose</li>
                <li>Scrape, crawl, or systematically extract data from the Site without written permission</li>
                <li>Submit false, misleading, or fraudulent listing claims</li>
                <li>Interfere with the operation of the Site</li>
                <li>Attempt to gain unauthorized access to any portion of the Site</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">5. Studio Listings</h2>
              <p className="mb-3">
                Listings on this Site are compiled from public sources. Studio owners and authorized
                representatives may request corrections, updates, or removal of their listing at any
                time by contacting us. We will process removal requests within 5 business days.
              </p>
              <p>
                Studio owners who claim their listing are responsible for the accuracy of any
                information they provide or update.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">6. Intellectual Property</h2>
              <p>
                The design, layout, and original content of this Site are owned by Ballroom Dance
                Directory. Studio names and brand names are the property of their respective owners
                and are used solely for identification purposes. You may not reproduce, distribute,
                or create derivative works from this Site&apos;s original content without written
                permission.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">7. Disclaimer of Warranties</h2>
              <p>
                This Site is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
                We do not warrant that the Site will be uninterrupted, error-free, or that listing
                information is accurate or complete. Your use of the Site is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Ballroom Dance Directory shall not be liable
                for any indirect, incidental, special, or consequential damages arising from your
                use of the Site or reliance on any listing information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">9. DMCA / Copyright Policy</h2>
              <p className="mb-3">
                We respect the intellectual property rights of others. If you believe that content
                on this Site infringes your copyright, please send a DMCA takedown notice to our
                designated agent with the following information:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Identification of the copyrighted work claimed to be infringed</li>
                <li>Identification of the material on this Site you claim is infringing</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief that the use is not authorized</li>
                <li>A statement under penalty of perjury that the information is accurate</li>
                <li>Your electronic or physical signature</li>
              </ul>
              <p className="mt-3">
                DMCA Agent contact: info@ballroomdancedirectory.com
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">10. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use of the Site after changes
                are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">11. Contact</h2>
              <p>
                For questions about these Terms, please{" "}
                <Link href="/contact" className="underline" style={{ color: "#b8922a" }}>contact us</Link>.
              </p>
            </section>

          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="px-6 py-10 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
        </div>
      </section>
    </main>
  );
}
