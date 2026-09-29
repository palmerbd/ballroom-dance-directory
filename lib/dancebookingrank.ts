/**
 * Dance Booking Rank — city market reports built by the dance-market-report skill
 * (SiteTradeIn site audit + live ChatGPT / Perplexity / Google AI checks) and
 * published as static HTML:
 *   public/dancebookingrank/<slug>/index.html        -> /dancebookingrank/<slug>
 *   public/dancebookingrank/<slug>/seo-details.html  -> /dancebookingrank/<slug>/seo-details
 * The clean URLs come from the rewrites in next.config.ts. Add one entry per
 * published city so both pages are listed in the sitemap.
 */
export const DANCE_BOOKING_RANK: { slug: string; published: string }[] = [
  { slug: "fort-worth-tx", published: "2026-09-29" },
];
