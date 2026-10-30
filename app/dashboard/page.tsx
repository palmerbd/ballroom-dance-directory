"use client";

// ─── /dashboard — Studio Owner Dashboard ─────────────────────────────────────
// Requires a Supabase session (shows a sign-in prompt linking to /login if not).
// Shows every listing the owner manages (looked up by account or verified email
// via /api/owner/claims), claim status, password settings and next steps.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Claim } from "@/lib/supabase";
import PhotoManager from "@/components/PhotoManager";
import StudioProfileEditor from "@/components/StudioProfileEditor";

type PageState = "loading" | "unauthenticated" | "no_claim" | "ready";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  pending:  {
    label: "Pending Review",
    color: "#92400e", bg: "#fef3c7",
    desc:  "Your claim has been submitted. Our team will review it within 1-2 business days.",
  },
  verified: {
    label: "Under Review",
    color: "#92400e", bg: "#fef3c7",
    desc:  "Your email is verified and your claim is in our review queue. We'll send an approval email within 1 business day.",
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
  const [claims,    setClaims]    = useState<Claim[]>([]);
  const [selected,  setSelected]  = useState(0);
  const [email,     setEmail]     = useState("");
  const [hasPassword, setHasPassword] = useState(false);

  // Password card state
  const [pw,       setPw]       = useState("");
  const [pw2,      setPw2]      = useState("");
  const [pwBusy,   setPwBusy]   = useState(false);
  const [pwMsg,    setPwMsg]    = useState<{ ok: boolean; text: string } | null>(null);

  const claim: Claim | null = claims[selected] ?? null;

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      setEmail(session.user.email || "");
      setHasPassword(!!session.user.user_metadata?.has_password);

      // All listings this owner manages (by account, or by verified email for
      // listings our team set up on the owner's behalf).
      try {
        const res = await fetch("/api/owner/claims", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 401) { setPageState("unauthenticated"); return; }
        const body = await res.json();
        const list = (body.claims || []) as Claim[];
        if (!list.length) { setPageState("no_claim"); return; }
        setClaims(list);
        setPageState("ready");
      } catch {
        setPageState("no_claim");
      }
    }
    load();
  }, []);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.length < 8) { setPwMsg({ ok: false, text: "Use at least 8 characters." }); return; }
    if (pw !== pw2)    { setPwMsg({ ok: false, text: "The two passwords don't match." }); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw, data: { has_password: true } });
    setPwBusy(false);
    if (error) { setPwMsg({ ok: false, text: error.message || "Could not save your password." }); return; }
    setHasPassword(true);
    setPw(""); setPw2("");
    setPwMsg({ ok: true, text: "Password saved. You can now sign in with your email and password." });
  }

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
          <h1 className="font-bold text-gray-900 text-xl mb-2">Sign in to your dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">
            Studio owners can sign in to manage their listing.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center
                       transition-all hover:brightness-110 mb-3"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            Owner Login
          </Link>
          <p className="text-gray-400 text-xs">
            Don&apos;t manage a listing yet?{" "}
            <Link href="/claim" className="text-yellow-700 hover:underline">Claim your studio</Link>.
          </p>
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
            We couldn&apos;t find a listing for this email. You may have claimed it with a
            different address, or it isn&apos;t claimed yet. If our team set up your listing, sign
            in with the email you gave us, or <Link href="/contact" className="text-yellow-700 hover:underline">contact us</Link>.
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

        {/* Listing switcher (owners with more than one studio) */}
        {claims.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-3">Your listings ({claims.length})</h2>
            <div className="space-y-2">
              {claims.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    i === selected ? "border-yellow-400 bg-yellow-50 font-semibold text-gray-900" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {c.studio_title}
                </button>
              ))}
            </div>
          </div>
        )}

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
                      Featured Listing — $49/mo <span className="text-white/30 line-through font-normal normal-case">$99</span>
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
                  <p className="text-white/30 text-xs mt-2">$49/mo promo rate (reg. $99) · Cancel anytime · Powered by Stripe</p>
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

        {/* Featured listing customisation — description, social, reviews, promo */}
        {claim!.tier === "paid" && (
          <StudioProfileEditor
            claimId={claim!.id}
            studioSlug={claim!.studio_slug}
            studioTitle={claim!.studio_title}
            studioCity={(claim as Claim & { studio_city?: string }).studio_city ?? ""}
            studioState={(claim as Claim & { studio_state?: string }).studio_state ?? ""}
          />
        )}

        {/* Password / sign-in settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-1">{hasPassword ? "Change your password" : "Create a password"}</h3>
          <p className="text-gray-500 text-sm mb-4">
            {hasPassword
              ? "Update the password you use to sign in."
              : "Set a password so you can sign in any time at Owner Login without waiting for an email link."}
          </p>
          <form onSubmit={handleSetPassword} className="grid sm:grid-cols-2 gap-3">
            <input type="password" autoComplete="new-password" placeholder="New password (8+ characters)"
              value={pw} onChange={(e) => setPw(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-sm" />
            <input type="password" autoComplete="new-password" placeholder="Confirm password"
              value={pw2} onChange={(e) => setPw2(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-sm" />
            <div className="sm:col-span-2 flex items-center gap-3">
              <button type="submit" disabled={pwBusy || !pw}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-900 text-sm hover:brightness-110 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
                {pwBusy ? "Saving\u2026" : "Save password"}
              </button>
              {pwMsg && <span className={`text-sm ${pwMsg.ok ? "text-green-700" : "text-red-600"}`}>{pwMsg.text}</span>}
            </div>
          </form>
        </div>

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
