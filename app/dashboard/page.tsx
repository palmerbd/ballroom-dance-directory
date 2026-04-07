"use client";

// ─── /dashboard — Studio Owner Dashboard ─────────────────────────────────────
// Requires Supabase session (redirects to /claim if not logged in).
// Shows the owner's claimed listing, claim status, and next steps.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Claim } from "@/lib/supabase";
import PhotoManager from "@/components/PhotoManager";

type PageState = "loading" | "unauthenticated" | "no_claim" | "ready";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  pending:  {
    label: "Pending Review",
    color: "#92400e", bg: "#fef3c7",
    desc:  "Your claim has been submitted. Our team will review it within 1-2 business days.",
  },
  verified: {
    label: "Verified",
    color: "#065f46", bg: "#d1fae5",
    desc:  "Your email has been verified. Claim review is in progress.",
  },
  approved: {
    label: "Approved",
    color: "#1e3a8a", bg: "#dbeafe",
    desc:  "Your listing is claimed and showing a Verified Owner badge.",
  },
  rejected: {
    label: "Not Approved",
    color: "#991b1b", bg: "#fee2e2",
    desc:  "We were unable to verify your ownership. Please contact us for details.",
  },
};

export default function DashboardPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [claim,     setClaim]     = useState<Claim | null>(null);
  const [email,     setEmail]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      setEmail(session.user.email || "");

      // Fetch this user's claim
      const { data } = await supabase
        .from("claims")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) { setPageState("no_claim"); return; }
      setClaim(data as Claim);
      setPageState("ready");
    }
    load();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (pageState === "loading") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  // ── Not logged in ──────────────────────────────────────────────────────────

  if (pageState === "unauthenticated") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">&#128274;</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">Sign in required</h1>
          <p className="text-gray-500 text-sm mb-6">
            You need to claim a studio listing before you can access the dashboard.
          </p>
          <Link
            href="/claim"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center
                       transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            Claim Your Listing
          </Link>
        </div>
      </main>
    );
  }

  // ── No claim yet ───────────────────────────────────────────────────────────

  if (pageState === "no_claim") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">&#128237;</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">No claim on file</h1>
          <p className="text-gray-500 text-sm mb-2">
            Logged in as <strong>{email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You haven&apos;t claimed a listing yet, or your claim may be associated with a
            different email address.
          </p>
          <Link
            href="/claim"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center
                       transition-all hover:brightness-110 mb-3"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            Claim a Listing
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  const statusCfg = STATUS_CONFIG[claim!.status] || STATUS_CONFIG.pending;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="pt-6 pb-10 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Nav row — Back on left, Sign out on right, same vertical baseline */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
              &larr; Back to directory
            </Link>
            <button
              onClick={handleSignOut}
              className="text-white/40 hover:text-white/80 text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
          {/* Title row */}
          <h1 className="font-bold text-white text-2xl">Studio Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">{email}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Claim status card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Your Listing</h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ color: statusCfg.color, background: statusCfg.bg }}
            >
              {statusCfg.label}
            </span>
          </div>

          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: "#fffbf0", border: "1.5px solid #e8c560" }}
          >
            <div className="font-bold text-gray-900">{claim!.studio_title}</div>
            <Link
              href={`/studios/${claim!.studio_slug}`}
              className="text-xs text-yellow-700 hover:underline mt-1 inline-block"
            >
              View listing &#8599;
            </Link>
          </div>

          <p className="text-sm text-gray-500 mb-4">{statusCfg.desc}</p>

          {/* Claim details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Name</div>
              <div className="text-gray-700">{claim!.owner_name}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Email</div>
              <div className="text-gray-700">{claim!.owner_email}</div>
            </div>
            {claim!.owner_phone && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Phone</div>
                <div className="text-gray-700">{claim!.owner_phone}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Submitted</div>
              <div className="text-gray-700">
                {new Date(claim!.created_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade / Featured status card (shown for verified/approved) */}
        {(claim!.status === "verified" || claim!.status === "approved") && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
          >
            {claim!.tier === "paid" ? (
              /* ── Already on Featured plan ── */
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                    &#11088; Featured Listing &mdash; Active
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">You&apos;re Featured!</h3>
                  <p className="text-white/60 text-sm">
                    Your listing has the gold Featured badge, lead capture form, and priority
                    placement in search results. Students can contact you directly.
                  </p>
                </div>
                <span className="text-3xl ml-4">&#11088;</span>
              </div>
            ) : (
              /* ── Upgrade CTA ── */
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Featured Listing — $49/mo
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Upgrade to Featured</h3>
                    <p className="text-white/60 text-sm">
                      Get a lead capture form, &ldquo;Featured&rdquo; badge, priority placement in
                      search results, and monthly performance insights.
                    </p>
                  </div>
                  <span className="text-3xl ml-4">&#11088;</span>
                </div>
                <div className="mt-5">
                  <Link
                    href="/upgrade"
                    className="inline-block px-6 py-2.5 rounded-xl font-bold text-gray-900 text-sm
                               transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
                  >
                    Upgrade to Featured &rarr;
</Link>
                  <p className="text-white/30 text-xs mt-2">Cancel anytime · Powered by Stripe</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Photo management — Featured tier only */}
        {claim!.tier === "paid" && (
          <PhotoManager
            claimId={claim!.id}
            studioSlug={claim!.studio_slug}
          />
        )}

        {/* Help */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-2">Questions?</h3>
          <p className="text-gray-500 text-sm mb-3">
            Need to update your studio information or have a question about your claim?
          </p>
          <Link
            href="/contact"
            className="text-sm font-semibold text-yellow-700 hover:underline"
          >
            Contact us &rarr;
          </Link>
        </div>

      </div>
    </main>
  );
}
