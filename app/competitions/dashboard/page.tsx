"use client";

// ─── /competitions/dashboard — Competition Organizer Dashboard ────────────────
// Requires Supabase session (redirects to /competitions/claim if not logged in).
// Stage 2: Shows claim status, next steps, and upgrade prompt.
// Stage 3: Will add an edit form that writes to competition_overrides.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { CompetitionClaim } from "@/lib/supabase";

type PageState = "loading" | "unauthenticated" | "no_claim" | "ready";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  pending: {
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
    desc:  "Your listing is claimed and showing a Verified Organizer badge.",
  },
  rejected: {
    label: "Not Approved",
    color: "#991b1b", bg: "#fee2e2",
    desc:  "We were unable to verify your ownership. Please contact us for details.",
  },
};

export default function CompetitionDashboardPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [claim,     setClaim]     = useState<CompetitionClaim | null>(null);
  const [email,     setEmail]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("competition_claims")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) { setPageState("no_claim"); return; }
      setClaim(data as CompetitionClaim);
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
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (pageState === "unauthenticated") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">Sign in required</h1>
          <p className="text-gray-500 text-sm mb-6">
            Please claim your competition listing first. You&apos;ll receive a magic link to sign in.
          </p>
          <Link
            href="/competitions/claim"
            className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
          >
            Claim Your Listing
          </Link>
        </div>
      </main>
    );
  }

  // ── No claim found ─────────────────────────────────────────────────────────
  if (pageState === "no_claim") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">No claim found</h1>
          <p className="text-gray-500 text-sm mb-6">
            We don&apos;t have a claim on file for <strong>{email}</strong>.
            Start by claiming your competition listing.
          </p>
          <Link
            href="/competitions/claim"
            className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
          >
            Claim Your Listing
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full mt-4 text-xs text-gray-400 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  // ── Ready ──────────────────────────────────────────────────────────────────
  const statusCfg = STATUS_CONFIG[claim!.status] ?? STATUS_CONFIG.pending;
  const compUrl   = `/competitions/${claim!.competition_slug}`;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-white/50 text-xs mb-1 font-medium uppercase tracking-wide">Organizer Dashboard</p>
            <h1 className="font-bold text-white text-2xl">{claim!.competition_name}</h1>
            <p className="text-white/60 text-sm mt-1">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/40 hover:text-white text-xs transition-colors mt-1"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base">Claim Status</h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">{statusCfg.desc}</p>
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Competition</p>
              <p className="text-gray-900 font-medium">{claim!.competition_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Listing Tier</p>
              <p className="text-gray-900 font-medium capitalize">{claim!.tier}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Your Name</p>
              <p className="text-gray-900 font-medium">{claim!.organizer_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Claimed</p>
              <p className="text-gray-900 font-medium">
                {new Date(claim!.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={compUrl}
              target="_blank"
              className="text-sm font-semibold hover:underline"
              style={{ color: "#1d4ed8" }}
            >
              View your competition listing ↗
            </Link>
          </div>
        </div>

        {/* Edit listing — Stage 3 placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">Manage Your Listing</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">
              Coming Soon
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Update your competition dates, venue, website, and registration link. Changes go live
            immediately on your listing page.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {["Dates & Venue", "Website & Registration", "Description", "Contact Info"].map((item) => (
              <div key={item}
                className="rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-400 bg-gray-50 flex items-center gap-2">
                <span className="text-gray-300">○</span> {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Stage 3 feature — launching soon. You&apos;ll receive an email when it&apos;s available.
          </p>
        </div>

        {/* Upgrade to Featured */}
        {claim!.tier === "free" && (
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)" }}
          >
            <div className="absolute top-4 right-4 text-2xl opacity-20">⭐</div>
            <h2 className="font-bold text-white text-base mb-2">Upgrade to Featured — $199/yr</h2>
            <p className="text-blue-100 text-sm mb-4">
              Get priority placement in search results, a Featured badge, and appear in city &amp;
              style landing pages — in front of dancers actively searching for your event.
            </p>
            <ul className="space-y-1.5 text-blue-100 text-sm mb-5">
              {[
                "⭐ Featured badge on all listings",
                "Priority placement in search & browse results",
                "\"Upcoming Near You\" city page widget",
                "Style and region landing page inclusion",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-blue-300 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/20 text-white cursor-not-allowed opacity-60"
            >
              Upgrade Coming Soon (Stage 4)
            </button>
          </div>
        )}

        {/* Help */}
        <div className="text-center pt-2 pb-6">
          <p className="text-gray-400 text-sm">
            Questions?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>
            {" "}or{" "}
            <Link href="/competitions" className="text-blue-600 hover:underline">browse all competitions</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
