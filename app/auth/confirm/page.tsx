"use client";

// ─── /auth/confirm — email link landing page (on our own domain) ─────────────
// Supabase email templates link here instead of to <project>.supabase.co, e.g.
//   https://www.ballroomdancedirectory.com/auth/confirm?token_hash={{ .TokenHash }}&type=email
// Keeping the link on ballroomdancedirectory.com (same domain as the sender) stops
// Gmail flagging the email as a dangerous / phishing link.
//
// The one-time token is only redeemed when the person clicks the button, so email
// security scanners that pre-open links can't use it up before the owner does.

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const GOLD = { background: "linear-gradient(135deg,#b8922a,#e8c560)" };
const VALID: EmailOtpType[] = ["email", "magiclink", "signup", "recovery", "invite", "email_change"];

function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenHash = params.get("token_hash") || "";
  const rawType = (params.get("type") || "email") as EmailOtpType;
  const type: EmailOtpType = VALID.includes(rawType) ? rawType : "email";
  const isReset = type === "recovery";

  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState(tokenHash ? "" : "This link is missing its sign-in code.");

  async function handleContinue() {
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (err) {
      setBusy(false);
      setError("This link has expired or was already used. Links work once and expire after about an hour.");
      return;
    }
    if (isReset) {
      router.replace("/reset-password");
    } else {
      // /claim/callback finishes any pending claim, then routes to the dashboard.
      router.replace("/claim/callback");
    }
  }

  return (
    <main style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#b8922a" }}>
          Ballroom Dance Directory
        </p>
        <h1 className="font-bold text-gray-900 text-2xl mb-2">
          {isReset ? "Reset your password" : "Sign in to your studio dashboard"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isReset
            ? "Click below to continue and choose a new password."
            : "Click below to finish signing in."}
        </p>

        {error ? (
          <>
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-5">{error}</p>
            <Link href={isReset ? "/login?mode=forgot" : "/login?mode=link"}
              className="block w-full py-3 rounded-xl font-bold text-gray-900 text-sm hover:brightness-110" style={GOLD}>
              Send me a new link
            </Link>
          </>
        ) : (
          <button onClick={handleContinue} disabled={busy}
            className="w-full py-3 rounded-xl font-bold text-gray-900 text-sm hover:brightness-110 disabled:opacity-50" style={GOLD}>
            {busy ? "Signing you in…" : isReset ? "Continue to reset password" : "Continue to my dashboard"}
          </button>
        )}

        <p className="text-gray-400 text-xs mt-6">
          Didn&apos;t request this? You can ignore the email &mdash; nothing changes unless you click.
        </p>
      </div>
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<main style={{ background: "#0c1428", minHeight: "100vh" }} />}>
      <ConfirmInner />
    </Suspense>
  );
}
