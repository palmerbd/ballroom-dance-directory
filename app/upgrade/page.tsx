"use client";

// ─── /upgrade — Featured Listing Upgrade Page ──────────────────────────────────────────────
// Only accessible to verified/approved claim owners (redirects unauthenticated users).
// Shows the $49/mo Featured plan and initiates Stripe Checkout.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Claim } from "@/lib/supabase";

type PageState = "loading" | "unauthenticated" | "no_claim" | "already_paid" | "ready" | "redirecting";

const FEATURES = [
  { icon: "\uD83D\uDCEC", title: "Lead Capture Form",         desc: "Prospective students contact you directly from your listing. Their name, email, and message land in your inbox instantly." },
  { icon: "\u2B50",        title: "Featured Badge",            desc: "A gold \u2018Featured\u2019 badge on your listing card sets you apart from every other studio in the directory." },
  { icon: "\uD83D\uDD1D", title: "Priority Placement",        desc: "Featured listings appear above free listings in all search results and city pages \u2014 more eyeballs, more inquiries." },
  { icon: "\uD83D\uDCF8", title: "Enhanced Profile",          desc: "Upload your own photos, add a promo video link, and write a custom description that replaces the default copy." },
  { icon: "\uD83D\uDCCA", title: "Monthly Performance Report", desc: "See how many people viewed your listing and how many clicked to contact you each month." },
];

export default function UpgradePage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [claim,     setClaim]     = useState<Claim | null>(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      const { data } = await supabase
        .from("claims")
        .select("*")
        .eq("user_id", session.user.id)
        .in("status", ["verified", "approved"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data)               { setPageState("no_claim");     return; }
      if (data.tier === "paid") { setPageState("already_paid"); return; }

      setClaim(data as Claim);
      setPageState("ready");
    }
    load();
  }, []);

  async function handleUpgrade() {
    if (!claim) return;
    setPageState("redirecting");
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_id:     claim.id,
          studio_title: claim.studio_title,
          owner_email:  claim.owner_email,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error || "Something went wrong. Please try again.");
        setPageState("ready");
        return;
      }

      window.location.href = json.url;
    } catch {
      setError("Network error. Please try again.");
      setPageState("ready");
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  // ── Not logged in ──────────────────────────────────────────────────────────────────────────
  if (pageState === "unauthenticated") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">&#128274;</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">Claim your listing first</h1>
          <p className="text-gray-500 text-sm mb-6">
            You need to claim and verify your studio listing before upgrading to Featured.
          </p>
          <Link href="/claim"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
            Claim Your Listing
          </Link>
        </div>
      </main>
    );
  }

  // ── No eligible claim ──────────────────────────────────────────────────────────────────────────
  if (pageState === "no_claim") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">&#128237;</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">No verified claim found</h1>
          <p className="text-gray-500 text-sm mb-6">
            Upgrade is available once your listing claim has been verified.
          </p>
          <Link href="/dashboard"
            className="text-sm font-semibold text-yellow-700 hover:underline">
            Back to dashboard &rarr;
          </Link>
        </div>
      </main>
    );
  }

  // ── Already on paid plan ─────────────────────────────────────────────────────────────────────────
  if (pageState === "already_paid") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">&#11088;</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">You&apos;re already Featured!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your listing is on the Featured plan. Manage your subscription from the dashboard.
          </p>
          <Link href="/dashboard"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── Main upgrade page ─────────────────────────────────────────────────────────────────────────────
  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="py-16 px-6 text-center">
        <Link href="/dashboard" className="text-white/40 hover:text-white text-sm transition-colors block mb-6">
          &larr; Back to dashboard
        </Link>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: "#b8922a22", color: "#e8c560", border: "1px solid #b8922a" }}>
          Featured Listing
        </div>
        <h1 className="font-bold text-white text-4xl mb-4">
          Turn your listing into a<br />lead generation machine
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
          Upgrade <strong className="text-white">{claim?.studio_title}</strong> to Featured and
          start receiving direct inquiries from students searching in your area.
        </p>

        {/* Price */}
        <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-8 py-6 mb-8">
          <div className="text-white/50 text-sm mb-1">Monthly subscription</div>
          <div className="text-white font-bold text-5xl">$49<span className="text-2xl text-white/50 font-normal">/mo</span></div>
          <div className="text-white/40 text-xs mt-2">Cancel anytime. No contracts.</div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleUpgrade}
            disabled={pageState === "redirecting"}
            className="px-10 py-4 rounded-xl font-bold text-gray-900 text-base transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            {pageState === "redirecting" ? "Redirecting to checkout\u2026" : "Upgrade to Featured \u2192"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-white/30 text-xs">
            Secure checkout powered by Stripe. Your card is never stored on our servers.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-bold text-gray-900 text-2xl text-center mb-10">
          Everything included in Featured
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="font-bold text-gray-900 text-xl mb-6">Common questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your dashboard and your listing reverts to the standard claimed tier at the end of your billing period. No penalties.",
              },
              {
                q: "How quickly do leads arrive?",
                a: "Instantly. When a student submits the contact form on your listing, the message is emailed to you within seconds.",
              },
              {
                q: "What if I&apos;m not approved yet?",
                a: "Upgrade requires a verified claim. If your claim is still pending review, check back in 1-2 business days.",
              },
              {
                q: "Do you offer annual pricing?",
                a: "Coming soon. Contact us if you&apos;d like to discuss annual billing.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={handleUpgrade}
            disabled={pageState === "redirecting"}
            className="px-10 py-4 rounded-xl font-bold text-gray-900 text-base transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            {pageState === "redirecting" ? "Redirecting\u2026" : "Upgrade to Featured \u2014 $49/mo \u2192"}
          </button>
          <p className="text-gray-400 text-xs mt-3">Cancel anytime &middot; Powered by Stripe</p>
        </div>
      </div>
    </main>
  );
}
