import type { NextConfig } from "next";

const PROD_DOMAIN = "www.ballroomdancedirectory.com";
const VERCEL_URL  = "ballroom-dance-directory.vercel.app";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
      {
        protocol: "https",
        hostname: "pcthfpqwdrfszwasxfei.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ── Canonical enforcement ────────────────────────────────────────────────────
  // 1. Redirect non-www → www (consolidates link equity)
  // 2. Tell Google not to index the Vercel preview URL
  // 3. 301 redirects for GSC "Not found (404)" URLs — studios renamed/removed,
  //    duplicate-city-suffix slugs created during early scrape, and stale city routes.
  async redirects() {
    return [
      // ── Non-www → www ─────────────────────────────────────────────────────
      {
        source: "/:path*",
        has: [{ type: "host", value: "ballroomdancedirectory.com" }],
        destination: `https://${PROD_DOMAIN}/:path*`,
        permanent: true,
      },

      // ── Studio slug fixes: duplicate-city-suffix → cleaned slug ──────────
      // These slugs were created during the initial Google Places scrape before
      // slug deduplication ran; Google crawled them and now they 404.
      {
        source: "/studios/arthur-murray-dance-studio-temecula-temecula",
        destination: "/studios/arthur-murray-dance-studio-temecula",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-ventura-ventura-4",
        destination: "/studios/arthur-murray-dance-studio-ventura-4",
        permanent: true,
      },
      // Canadian locations — never belonged in US directory; send to root
      {
        source: "/studios/arthur-murray-dance-studio-coquitlam-coquitlam",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-victoria-victoria",
        destination: "/studios",
        permanent: true,
      },

      // ── Deleted / removed studios → main directory ────────────────────────
      {
        source: "/studios/the-ballet-school-performing-arts-walnut-creek",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/top-tier-dance-coaching-corpus-christi",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/fred-astaire-dance-studios-princeton",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/mitchells-dance-studio-beverly",
        destination: "/studios",
        permanent: true,
      },

      // ── Stale city / city×style routes ───────────────────────────────────
      // lafayette-township was never a supported city slug; no studios exist there.
      {
        source: "/studios/city/lafayette-township",
        destination: "/studios",
        permanent: true,
      },
      // las-vegas salsa: no salsa studios in Las Vegas → redirect to city page
      {
        source: "/studios/city/las-vegas/style/salsa",
        destination: "/studios/city/las-vegas",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Block Googlebot from indexing the Vercel deployment URL
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_URL }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
