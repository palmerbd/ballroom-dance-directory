import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/ is infrastructure — never crawl.
        // /admin is a password-gated internal tool — no SEO value.
        // NOTE: /_next/ is intentionally NOT listed here.
        // Googlebot needs /_next/static/ to load JS/CSS bundles for page rendering.
        // Disallowing /_next/ prevents proper rendering and hurts indexing quality.
        // /claim, /dashboard, /upgrade are also NOT listed here — those routes have
        // noindex in their layout.tsx files. Allowing crawl + noindex in layout is
        // the correct way to remove pages from Google's index.
        disallow: ["/api/", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
