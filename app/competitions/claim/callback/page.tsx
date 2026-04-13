"use client";

// /competitions/claim/callback — Magic Link Callback (Competition Organizer)
// Supabase redirects here after the organizer clicks the magic link.
// Exchanges the auth code for a session, reads pending claim data from
// localStorage (primary) or user_metadata (cross-device fallback).
// Then POSTs to /api/competition-claim and redirects to /competitions/dashboard.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "verifying" | "claiming" | "success" | "error";

export default function CompetitionClaimCallbackPage() {
  const router = useRouter();
  const [status,  setStatus]  = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your identity...");

  useEffect(() => {
    async function handleCallback() {
      // Step 1: Exchange the magic link code for a session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setStatus("error");
        setMessage("Verification failed. The link may have expired. Please try claiming again.");
        return;
      }

      // Step 2: Read pending claim data.
      // Primary:  localStorage (same device/browser as the form).
      // Fallback: user_metadata embedded in signInWithOtp options.data
      //           (works when the magic link is opened in a different browser).
      let claim: Record<string, string>;

      const raw = localStorage.getItem("pendingCompetitionClaim");
      if (raw) {
        try {
          claim = JSON.parse(raw);
        } catch {
          setStatus("error");
          setMessage("Claim data was corrupted. Please start the claim process again.");
          return;
        }
      } else {
        const meta = sessionData.session.user.user_metadata || {};
        if (meta.competition_slug && meta.organizer_name && meta.organizer_email) {
          claim = {
            competition_slug:  String(meta.competition_slug),
            competition_name:  String(meta.competition_name || ""),
            organizer_name:    String(meta.organizer_name),
            organizer_email:   String(meta.organizer_email),
            organizer_phone:   String(meta.organizer_phone || ""),
          };
        } else {
          // No claim in flight — user might have authenticated for something else
          router.push("/competitions/dashboard");
          return;
        }
      }

      // Step 3: POST to /api/competition-claim to record in Supabase + send emails
      setStatus("claiming");
      setMessage("Recording your claim...");

      try {
        const res = await fetch("/api/competition-claim", {
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
            setMessage("This competition listing has already been claimed by a verified organizer.");
          } else {
            throw new Error(body.message || "Unknown error");
          }
          return;
        }

        // Success — clear localStorage and go to organizer dashboard
        localStorage.removeItem("pendingCompetitionClaim");
        setStatus("success");
        setMessage("Claim verified! Redirecting to your dashboard...");
        setTimeout(() => router.push("/competitions/dashboard"), 1500);

      } catch (err) {
        console.error("Competition claim finalization error:", err);
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
            href="/competitions/claim"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl font-bold text-sm text-white
                       transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
          >
            Try Again
          </a>
        )}
        {(status === "verifying" || status === "claiming") && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </main>
  );
}
