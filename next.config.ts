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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ballroomdancedirectory.com" }],
        destination: `https://${PROD_DOMAIN}/:path*`,
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
