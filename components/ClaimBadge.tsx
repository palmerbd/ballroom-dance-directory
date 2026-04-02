"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
interface Props { slug: string; }
export default function ClaimBadge({ slug }: Props) {
  const [claimed, setClaimed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(`/api/claim/status?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json()).then((data) => setClaimed(data.claimed)).catch(() => setClaimed(false));
  }, [slug]);
  if (!claimed) {
    if (claimed === false) {
      return (<Link href="/claim"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-700 border border-dashed border-gray-200 rounded-full px-3 py-1.5 transition-colors">
        <span>🏷</span><span>Own this studio? Claim your listing</span></Link>);
    }
    return null;
  }
  return (<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
    style={{ background: "#d1fae5", color: "#065f46" }}>
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>Verified Owner</div>);
}
