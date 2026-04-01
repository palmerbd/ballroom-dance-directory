import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Ballroom Dance Directory — listing corrections, removal requests, claiming your studio, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <main style={{ background: "#f9f6f0", minHeight: "100vh" }}>
      {/* Header */}
      <section
        className="px-6 py-16"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#e8c560" }}>
            Contact
          </p>
          <h1 className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
            Get in Touch
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Listing corrections, removal requests, claiming your studio, or partnership inquiries.
          </p>
        </div>
      </section>

      {/* Reason cards */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: "\u{1F3E2}",
                title: "Claim Your Listing",
                desc: "Are you a studio owner? Claim your listing to edit your description, add photos, and manage your profile.",
              },
              {
                icon: "\u{270F}\uFE0F",
                title: "Listing Correction",
                desc: "Notice an error in your studio's address, phone, hours, or other details? Let us know and we'll fix it promptly.",
              },
              {
                icon: "\u{1F5D1}\uFE0F",
                title: "Removal Request",
                desc: "Studio owners and franchise representatives may request full removal of a listing. We honor all requests within 5 business days.",
              },
              {
                icon: "\u{1F91D}",
                title: "Partnership Inquiry",
                desc: "Interested in a data partnership, featured placement, or franchise-level account? We'd love to hear from you.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact info block */}
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-4">Send Us a Message</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Email us directly and include the studio name, city, and nature of your request.
              We respond to all inquiries within 2 business days.
            </p>
            <a
              href="mailto:info@ballroomdancedirectory.com"
              className="inline-block px-8 py-4 rounded-lg font-bold text-gray-900 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
            >
              info@ballroomdancedirectory.com
            </a>
            <p className="mt-6 text-sm text-gray-400">
              For DMCA takedown notices, please include all required information as specified in our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="px-6 py-10 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/studios" className="hover:text-gray-900 transition-colors">Browse Studios</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
        </div>
      </section>
    </main>
  );
}
