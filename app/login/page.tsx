"use client";

// ─── /login — Studio Owner Login ─────────────────────────────────────────────
// Three ways in, all backed by Supabase Auth:
//   1. Email + password                         (returning owners)
//   2. "Email me a sign-in link" (magic link)   (first-time owners / no password yet)
//   3. "Forgot password?" (reset email)         (owners who set a password and forgot it)
// Email links land on /claim/callback (already on Supabase's redirect allow-list),
// which routes to /dashboard or /reset-password.

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";
const CALLBACK = `${SITE_URL}/claim/callback`;

type Mode = "password" | "link" | "forgot";

const GOLD = { background: "linear-gradient(135deg,#b8922a,#e8c560)" };

function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again, or use “Email me a sign-in link” if you haven't set a password yet.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — use “Email me a sign-in link” below.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("exceeded")) return "Too many emails were sent to this address. Please wait a few minutes and check your spam folder.";
  return msg || "Something went wrong. Please try again.";
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("mode") as Mode) || "password";

  const [mode,     setMode]     = useState<Mode>(["password", "link", "forgot"].includes(initial) ? initial : "password");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");
  const [sentTo,   setSentTo]   = useState("");
  const [signedIn, setSignedIn] = useState<string | null>(null);

  // Already signed in? Offer the dashboard instead of the form.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSignedIn(data.session.user.email || "your account");
    });
  }, []);

  function switchMode(m: Mode) { setMode(m); setError(""); setSentTo(""); }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) { setError(friendlyError(err.message)); return; }
    router.push("/dashboard");
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try { localStorage.setItem("bddAuthIntent", JSON.stringify({ intent: "login", at: Date.now() })); } catch { /* ignore */ }
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: CALLBACK, shouldCreateUser: true },
    });
    setBusy(false);
    if (err) { setError(friendlyError(err.message)); return; }
    setSentTo(email.trim());
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try { localStorage.setItem("bddAuthIntent", JSON.stringify({ intent: "reset", at: Date.now() })); } catch { /* ignore */ }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: CALLBACK });
    setBusy(false);
    if (err) { setError(friendlyError(err.message)); return; }
    setSentTo(email.trim());
  }

  const titles: Record<Mode, { h: string; p: string }> = {
    password: { h: "Studio Owner Login",   p: "Sign in to manage your studio listing." },
    link:     { h: "Email me a sign-in link", p: "First time signing in, or haven't set a password yet? We'll email you a secure link — no password needed." },
    forgot:   { h: "Reset your password",  p: "Enter the email you use for your listing and we'll send you a link to choose a new password." },
  };

  return (
    <main style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full">

        {signedIn ? (
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-2xl mb-2">You&apos;re signed in</h1>
            <p className="text-gray-500 text-sm mb-6">Signed in as <strong>{signedIn}</strong>.</p>
            <Link href="/dashboard" className="block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center hover:brightness-110" style={GOLD}>
              Go to my dashboard &rarr;
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); setSignedIn(null); }}
              className="mt-4 text-sm text-gray-400 hover:text-gray-700"
            >
              Sign out and use a different account
            </button>
          </div>
        ) : sentTo ? (
          <div className="text-center">
            <div className="text-5xl mb-4">&#128236;</div>
            <h1 className="font-bold text-gray-900 text-xl mb-2">Check your inbox</h1>
            <p className="text-gray-500 text-sm mb-4">
              We sent a {mode === "forgot" ? "password reset" : "sign-in"} link to <strong>{sentTo}</strong>.
              The link works once and expires after about an hour.
            </p>
            <p className="text-gray-400 text-xs">
              Nothing there? Check spam, or{" "}
              <button onClick={() => setSentTo("")} className="text-yellow-700 hover:underline">try again</button>.
              {mode === "forgot" && <> If you never set a password, use{" "}
                <button onClick={() => switchMode("link")} className="text-yellow-700 hover:underline">a sign-in link</button> instead.</>}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#b8922a" }}>For studio owners</p>
            <h1 className="font-bold text-gray-900 text-2xl mb-1">{titles[mode].h}</h1>
            <p className="text-gray-500 text-sm mb-6">{titles[mode].p}</p>

            <form onSubmit={mode === "password" ? handlePassword : mode === "link" ? handleLink : handleForgot} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Email</label>
                <input id="email" type="email" required autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-sm" />
              </div>

              {mode === "password" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-gray-500">Password</label>
                    <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-yellow-700 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <input id="password" type="password" required autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 outline-none text-sm" />
                </div>
              )}

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={busy || !email.trim() || (mode === "password" && !password)}
                className="w-full py-3 rounded-xl font-bold text-gray-900 text-sm hover:brightness-110 disabled:opacity-50" style={GOLD}>
                {busy ? "Please wait…" : mode === "password" ? "Sign in" : mode === "link" ? "Email me a sign-in link" : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-sm text-center">
              {mode !== "password" && (
                <button onClick={() => switchMode("password")} className="block w-full text-gray-600 hover:text-gray-900">
                  Sign in with email and password
                </button>
              )}
              {mode !== "link" && (
                <button onClick={() => switchMode("link")} className="block w-full text-gray-600 hover:text-gray-900">
                  First time here or no password yet? <span className="text-yellow-700 font-semibold">Email me a sign-in link</span>
                </button>
              )}
              <p className="text-gray-400 text-xs pt-2">
                Don&apos;t manage a listing yet?{" "}
                <Link href="/claim" className="text-yellow-700 hover:underline">Claim your studio</Link>{" "}or{" "}
                <Link href="/contact" className="text-yellow-700 hover:underline">ask us to add it</Link>.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ background: "#0c1428", minHeight: "100vh" }} />}>
      <LoginInner />
    </Suspense>
  );
}
