import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Ballroom Dance Directory — how we collect, use, and protect your information.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/privacy" },
};

const EFFECTIVE_DATE = "April 1, 2026";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-8">

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Note:</strong> This Privacy Policy is a working draft and should be reviewed by
              legal counsel before the custom domain launches, especially if a claim flow or paid tier
              is added that collects user data.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6 text-gray-600 leading-relaxed">

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">1. Overview</h2>
              <p>
                Ballroom Dance Directory (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting
                your privacy. This Privacy Policy explains what information we collect, how we use
                it, and your rights with respect to that information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">2. Information We Collect</h2>
              <p className="mb-3 font-medium text-gray-700">Information you provide to us:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm mb-4">
                <li>Contact form submissions (name, email, message)</li>
                <li>Studio claim requests (name, email, phone, studio affiliation)</li>
                <li>Studio listing information submitted by verified owners</li>
              </ul>
              <p className="mb-3 font-medium text-gray-700">Information collected automatically:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Standard web server logs (IP address, browser type, pages visited, timestamps)</li>
                <li>Analytics data (if analytics tools are added in the future, this policy will be updated)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">3. How We Use Information</h2>
              <p className="mb-3">We use information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Respond to contact form submissions and inquiries</li>
                <li>Process and verify studio listing claims</li>
                <li>Maintain and improve the directory</li>
                <li>Deliver lead inquiries to studio owners who subscribe to the paid featured tier</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">4. Information We Do Not Collect</h2>
              <p className="mb-3">We do not collect:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Payment card information (processed directly by our payment provider)</li>
                <li>Social Security numbers or government ID numbers</li>
                <li>Health or medical information</li>
                <li>Information about children under 13</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">5. Sharing of Information</h2>
              <p className="mb-3">
                We do not sell your personal information. We may share information in the following
                limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>
                  <strong>Studio owners (paid tier):</strong> If you submit an inquiry through a
                  featured studio&apos;s listing, your name, email, and message will be shared with
                  that studio owner.
                </li>
                <li>
                  <strong>Service providers:</strong> We use third-party services (hosting, email
                  delivery) that may process data on our behalf under data processing agreements.
                </li>
                <li>
                  <strong>Legal compliance:</strong> We may disclose information if required by law
                  or in response to valid legal process.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">6. Studio Listing Data</h2>
              <p>
                Basic business information for studios listed on this directory (studio name,
                address, phone number, hours of operation) is compiled from publicly available
                sources. This information is not personal data under applicable privacy laws.
                Studio owners may request correction or removal of their listing at any time.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">7. Cookies</h2>
              <p>
                This Site currently uses only essential cookies necessary for basic site
                functionality. We do not use tracking cookies, advertising cookies, or third-party
                behavioral analytics. If this changes, this policy will be updated.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">8. Your Rights</h2>
              <p className="mb-3">
                Depending on your location, you may have rights including:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>The right to access information we hold about you</li>
                <li>The right to request correction of inaccurate information</li>
                <li>The right to request deletion of your information</li>
                <li>The right to opt out of communications</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please{" "}
                <Link href="/contact" className="underline" style={{ color: "#b8922a" }}>contact us</Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">9. Data Security</h2>
              <p>
                We implement reasonable technical and organizational measures to protect your
                information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will post the updated policy
                on this page with a revised effective date. Continued use of the Site after changes
                are posted constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-gray-900 text-xl mb-3">11. Contact</h2>
              <p>
                For questions about this Privacy Policy or to exercise your rights, please{" "}
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
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
        </div>
      </section>
    </main>
  );
}
