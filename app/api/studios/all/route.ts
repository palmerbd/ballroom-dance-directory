// ─── /api/studios/all ──────────────────────────────────────────────────────────
// Paginated proxy for fetching all dance studios from WP for audit tooling.
// Used by the VM-side audit script (run-audit-vm.js) which can reach Vercel
// but not the raw Hetzner WP IP.
//
// Query params:
//   ?page=1&per_page=100   (defaults: page=1, per_page=100, max per_page=100)
//
// Returns JSON:
//   { studios: [...], total: number, pages: number }

import { NextRequest, NextResponse } from "next/server";

const WP_API  = process.env.NEXT_PUBLIC_WP_API_URL || "http://5.78.144.42/wp-json";
const WP_AUTH = "Basic " + Buffer.from(
  `danceadmin:${process.env.WP_APP_PASSWORD || "KxIp Xqlw Q1ae cryw 3jb1 0fhO"}`
).toString("base64");

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g,           (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g,  (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g,   "&")
    .replace(/&lt;/g,    "<")
    .replace(/&gt;/g,    ">")
    .replace(/&quot;/g,  '"')
    .replace(/&apos;/g,  "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get("page")     || "1",   10));
  const perPage  = Math.min(100, parseInt(searchParams.get("per_page") || "100", 10));

  const fields = "id,title,acf";
  const wpUrl  = `${WP_API}/wp/v2/dance_studio?per_page=${perPage}&page=${page}&status=publish&_fields=${fields}`;

  try {
    const res = await fetch(wpUrl, {
      headers: { Authorization: WP_AUTH },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `WP API error ${res.status}` }, { status: 502 });
    }

    const total = parseInt(res.headers.get("X-WP-Total")     || "0", 10);
    const pages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    const raw   = await res.json();

    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: "Unexpected WP response" }, { status: 502 });
    }

    const studios = raw.map((post: any) => {
      const acf = post.acf || {};
      return {
        wp_id:   post.id,
        name:    decodeHtmlEntities(post.title?.rendered || ""),
        city:    [acf.studio_address_city, acf.studio_address_state].filter(Boolean).join(", "),
        address: acf.studio_address_street || "",
        phone:   acf.studio_phone          || "",
        website: acf.studio_website        || "",
      };
    });

    return NextResponse.json({ studios, total, pages });
  } catch (err) {
    console.error("[/api/studios/all] fetch error:", err);
    return NextResponse.json({ error: "Failed to reach WP API" }, { status: 502 });
  }
}
