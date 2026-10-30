"use client";

// /claim/callback -- Magic Link Callback
// Supabase redirects here after user clicks the magic link in their email.
// Exchanges the auth code for a session, reads pending claim data from
// localStorage (primary) or Supabase user_metadata (fallback -- works when
// the link is opened in a different browser than where the form was filled).
// Then calls /api/claim to finalize, and redirects to /dashboard.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "verifying" | "claiming" | "success" | "error";

export default function ClaimCallbackPage() {
  const router = useRouter();
  const [status,  setStatus]  = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your identity...");

  useEffect(() => {
    async function handleCallback() {
      // Step 1: Exchange the code for a session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setStatus("error");
        setMessage("Verification failed. The link may have expired. Please try claiming again.");
        return;
      }

      // Step 1b (Oct 2026): this page is also the landing page for owner sign-in links
      // and password-reset links sent from /login (it is already on Supabase's
      // redirect allow-list). Route those before any claim handling.
      const user = sessionData.session.user;
      let intent: string | null = null;
      try {
        const rawIntent = localStorage.getItem("bddAuthIntent");
        if (rawIntent) {
          const parsed = JSON.parse(rawIntent);
          if (parsed && Date.now() - Number(parsed.at || 0) < 2 * 60 * 60 * 1000) intent = String(parsed.intent);
        }
      } catch { /* ignore */ }
      const recoverySent = (user as { recovery_sent_at?: string }).recovery_sent_at;
      const recentRecovery = !!recoverySent && Date.now() - new Date(recoverySent).getTime() < 60 * 60 * 1000;
      const hasPendingClaim = !!localStorage.getItem("pendingClaim");

      if (intent === "reset" || (recentRecovery && !hasPendingClaim)) {
        router.replace("/reset-password");
        return;
      }
      if (intent === "login" && !hasPendingClaim) {
        try { localStorage.removeItem("bddAuthIntent"); } catch { /* ignore */ }
        router.replace("/dashboard");
        return;
      }

      // Listings this owner already manages (by account or verified email).
      let ownedSlugs: string[] = [];
      try {
        const ownRes = await fetch("/api/owner/claims", {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });
        if (ownRes.ok) {
          const own = await ownRes.json();
          ownedSlugs = (own.claims || []).map((c: { studio_slug: string }) => c.studio_slug);
        }
      } catch { /* non-fatal */ }

      // Step 2: Read pending claim data.
      // Primary source: localStorage (set on the same device/browser before the magic link was sent).
      // Fallback: Supabase user_metadata (set in signInWithOtp options.data -- works even when the
      // magic link is opened in a different browser or email app than where the form was filled out).
      let claim: Record<string, string>;

      const raw = localStorage.getItem("pendingClaim");
      if (raw) {
        try {
          claim = JSON.parse(raw);
        } catch {
          setStatus("error");
          setMessage("Claim data was corrupted. Please start the claim process again.");
          return;
        }
      } else {
        // localStorage empty -- try user metadata embedded in the magic link session
        const meta = sessionData.session.user.user_metadata || {};
        if (meta.studio_slug && meta.owner_name && meta.owner_email) {
          claim = {
            studio_id:    String(meta.studio_id || ""),
            studio_slug:  String(meta.studio_slug),
            studio_title: String(meta.studio_title || ""),
            owner_name:   String(meta.owner_name),
            owner_email:  String(meta.owner_email),
            owner_phone:  String(meta.owner_phone || ""),
          };
        } else {
          // Neither source has data -- session exists but no claim in flight
          router.push("/dashboard");
          return;
        }
      }

      // Returning owner signing in again: their claim is already on file, so don't
      // re-submit it (that used to fail with "already claimed by another owner").
      if (ownedSlugs.includes(claim.studio_slug)) {
        localStorage.removeItem("pendingClaim");
        router.replace("/dashboard");
        return;
      }

      // Step 3: POST to /api/claim to record claim in Supabase + update WP
      setStatus("claiming");
      setMessage("Recording your claim...");

      try {
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...claim,
            user_id: sessionData.session.user.id,
          }),
        });

        const body = await res.json();

        if (!res.ok) {
          if (body.code === "already_claimed") {
            setStatus("error");
            setMessage("This listing has already been claimed by another verified owner.");
          } else {
            throw new Error(body.message || "Unknown error");
          }
          return;
        }

        // Success -- clear localStorage and go to dashboard
        localStorage.removeItem("pendingClaim");
        setStatus("success");
        setMessage("Claim verified! Redirecting to your dashboard...");
        setTimeout(() => router.push("/dashboard"), 1500);

      } catch (err) {
        console.error("Claim finalization error:", err);
        setStatus("error");
        setMessage("Something went wrong while recording your claim. Please contact us.");
      }
    }

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const iconMap: Record<Status, string> = {
    verifying: "&#128272;",
    claiming:  "&#128196;",
    success:   "&#9989;",
    error:     "&#9888;",
  };

  return (
    <main
      style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6"
    >
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-5" dangerouslySetInnerHTML={{ __html: iconMap[status] }} />
        <h1 className="font-bold text-gray-900 text-xl mb-3">
          {status === "success" ? "Claim Verified!" :
           status === "error"   ? "Something went wrong" :
                                  "Processing your claim..."}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        {status === "error" && (
          <a
            href="/claim"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl font-bold text-sm text-gray-900
                       transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            Try Again
          </a>
        )}
        {(status === "verifying" || status === "claiming") && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </main>
  );
}
